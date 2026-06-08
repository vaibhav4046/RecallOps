"""RecallOps Cortex — OpenTelemetry instrumentation.

Emits REAL spans for the agent pipeline (tool calls, reasoning, audit). Spans
are captured in-process (so /llmops can show a real tool-call timeline) AND,
when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, exported over OTLP to any collector —
**Arize Phoenix** (`pip install arize-phoenix && phoenix serve`) for LLM
observability/evals, or **Dynatrace** for APM. Standards-based, no lock-in.

All of this is optional: if the OTel packages or endpoint are absent, every
helper degrades to a no-op and the app runs unchanged.
"""
from __future__ import annotations

import os
from contextlib import contextmanager

_enabled = False
_memory_exporter = None


def init() -> bool:
    """Set up the tracer once. Safe to call repeatedly."""
    global _enabled, _memory_exporter
    if _enabled:
        return True
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import SimpleSpanProcessor
        from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

        provider = TracerProvider(resource=Resource.create({"service.name": "recallops-cortex"}))
        _memory_exporter = InMemorySpanExporter()
        provider.add_span_processor(SimpleSpanProcessor(_memory_exporter))

        # Optional: export to Arize Phoenix / Dynatrace / any OTLP collector.
        if os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT"):
            try:
                from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
                from opentelemetry.sdk.trace.export import BatchSpanProcessor
                provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
            except Exception:
                pass  # OTLP exporter optional — in-memory still works

        trace.set_tracer_provider(provider)
        _enabled = True
    except Exception:
        _enabled = False
    return _enabled


@contextmanager
def span(name: str, attrs: dict | None = None):
    if not _enabled:
        yield None
        return
    from opentelemetry import trace
    tracer = trace.get_tracer("recallops")
    with tracer.start_as_current_span(name) as s:
        for k, v in (attrs or {}).items():
            try:
                s.set_attribute(k, v)
            except Exception:
                pass
        yield s


def enabled() -> bool:
    return _enabled


def reset() -> None:
    if _memory_exporter is not None:
        _memory_exporter.clear()


def captured_spans() -> list[dict]:
    """Finished spans from the last reset() — for the UI tool-call timeline."""
    if _memory_exporter is None:
        return []
    out = []
    for s in _memory_exporter.get_finished_spans():
        dur_ms = (s.end_time - s.start_time) / 1e6 if (s.end_time and s.start_time) else 0.0
        status = "OK"
        try:
            status = s.status.status_code.name
        except Exception:
            pass
        out.append({
            "name": s.name,
            "latencyMs": round(dur_ms, 2),
            "status": status,
            "attributes": {k: str(v) for k, v in dict(s.attributes or {}).items()},
        })
    # Children first (longest-running operations are usually the leaves).
    return [s for s in out if s["name"] != "agent.run"] + [s for s in out if s["name"] == "agent.run"]
