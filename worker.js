import * as webllm from "https://esm.run/@mlc-ai/web-llm@0.2.88";

let engine = null;

const post = (kind, extra = {}) => self.postMessage({ kind, ...extra });
const initProgressCallback = (t) => post("progress", { progress: t.progress || 0, text: t.text || "" });

try {
  const vram = {};
  for (const m of webllm.prebuiltAppConfig.model_list) vram[m.model_id] = m.vram_required_MB || 0;
  post("catalog", { vram });
} catch {}

async function loadModel(id, record) {
  if (engine) { try { engine.unload(); } catch {} }
  engine = null;
  const appConfig = record
    ? { ...webllm.prebuiltAppConfig, model_list: [{ ...record }, ...webllm.prebuiltAppConfig.model_list] }
    : undefined;
  engine = await webllm.CreateMLCEngine(id, { appConfig, initProgressCallback });
  post("loaded", { id });
}

async function generate(p) {
  const chunks = await engine.chat.completions.create({
    messages: p.messages,
    temperature: p.temperature ?? 0.7,
    top_p: p.top_p ?? 0.9,
    max_tokens: p.max_tokens ?? 1024,
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const c of chunks) {
    const d = c.choices?.[0]?.delta?.content || "";
    if (d) post("delta", { delta: d });
    if (c.usage) post("usage", { usage: c.usage });
  }
  post("done");
}

self.onmessage = async (e) => {
  const m = e.data || {};
  try {
    if (m.kind === "load") await loadModel(m.id, null);
    else if (m.kind === "loadCustom") await loadModel(m.id, m.record);
    else if (m.kind === "generate") await generate(m);
    else if (m.kind === "abort") { try { engine.interruptGenerate(); } catch {} }
  } catch (err) {
    const msg = String((err && err.message) || err);
    post("engine-error", { error: msg, aborted: /interrupt/i.test(msg) });
  }
};
