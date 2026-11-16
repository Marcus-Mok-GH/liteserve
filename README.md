# liteserve — LLM chat fully in the browser

WebLLM + WebGPU chat page hosted free on GitHub Pages. No API keys, no backend, no
server to sleep — once the model downloads (browser-cached), it runs on-device.

**Live:** https://marcus-mok-gh.github.io/liteserve/

- Default model: `Qwen3.5-2B-q4f16_1-MLC` (same family as the lite-coder fine-tune).
- Picker: Qwen3.5 0.8B / Qwen3 1.7B / Qwen2.5-Coder 1.5B / Llama-3.2 1B / SmolLM2 1.7B / Gemma-2 2B.
- "Custom model" box loads any MLC-compiled repo on Hugging Face. For repos named `...-q4fXX_Y-MLC`
  the page auto-derives the `*_cs1k-webgpu.wasm` model_lib URL; otherwise paste it manually.

## Serving the fine-tuned lite-coder weights (later)
1. Merge the LoRA adapter into the base model.
2. Convert with MLC-LLM to a WebGPU build (`mlc_llm.convert_weights` + wasm gen) — GPU needed.
3. Publish as `markermork/<name>-MLC` on Hugging Face and point the Custom model box at it.

## Stack
`index.html` (UI) + `worker.js` (the WebLLM engine runs in a dedicated web worker,
so model loading and token generation never block the UI thread). Imports
`@mlc-ai/web-llm@0.2.88` from jsDelivr, no build step.
Deploy = push to `main`; GitHub Pages serves it automatically.
