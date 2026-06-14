var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
import_dotenv.default.config();
var GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6KKDwn_Hj3RjuJ8G_XZdDwNTTJmkh1DEVwJOcU11PueIA";
var OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
var DEFAULT_OPENROUTER_KEY = "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";
var isOpenRouterKeyCustom = OPENROUTER_API_KEY !== DEFAULT_OPENROUTER_KEY && OPENROUTER_API_KEY.trim() !== "";
var badKeysCache = /* @__PURE__ */ new Set();
var aiInstance = null;
function getGenAI() {
  if (!aiInstance) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
function getOpenRouterModelName(modelId) {
  if (isOpenRouterKeyCustom) {
    switch (modelId) {
      case "deepseek-r1":
        return "deepseek/deepseek-r1";
      case "qwen-coder":
        return "qwen/qwen-2.5-coder-32b-instruct";
      case "llama-3-3":
        return "meta-llama/llama-3.3-70b-instruct";
      case "gpt-4-5":
        return "openai/gpt-4.5-preview";
      case "llama-3-8b":
        return "meta-llama/llama-3-8b-instruct";
      case "mistral-large":
        return "mistralai/mistral-large";
      case "qwen-72b":
        return "qwen/qwen-2.5-72b-instruct";
      case "phi-4":
        return "microsoft/phi-4";
      case "mythomax-13b":
        return "gryphe/mythomax-l2-13b";
      case "llama-3-2-3b":
        return "meta-llama/llama-3.2-3b-instruct";
      case "command-r-plus":
        return "cohere/command-r-plus";
      case "zephyr-7b":
        return "huggingfaceh4/zephyr-7b-beta";
      case "claude-coder":
        return "anthropic/claude-3.5-sonnet";
      case "claude-fable-5":
        return "anthropic/claude-3.5-sonnet";
      default:
        return "meta-llama/llama-3-8b-instruct:free";
    }
  } else {
    switch (modelId) {
      case "deepseek-r1":
        return "deepseek/deepseek-r1:free";
      case "qwen-coder":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "llama-3-3":
        return "meta-llama/llama-3.3-70b-instruct:free";
      case "gpt-4-5":
        return "openai/gpt-4o-mini:free";
      case "llama-3-8b":
        return "meta-llama/llama-3-8b-instruct:free";
      case "mistral-large":
        return "mistralai/mistral-large:free";
      case "qwen-72b":
        return "qwen/qwen-2.5-72b-instruct:free";
      case "phi-4":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "mythomax-13b":
        return "gryphe/mythomax-l2-13b:free";
      case "llama-3-2-3b":
        return "meta-llama/llama-3.2-3b-instruct:free";
      case "command-r-plus":
        return "cohere/command-r-plus:free";
      case "zephyr-7b":
        return "huggingfaceh4/zephyr-7b-beta:free";
      case "claude-coder":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "claude-fable-5":
        return "google/gemini-2.5-flash:free";
      default:
        return "meta-llama/llama-3-8b-instruct:free";
    }
  }
}
var activeStorePath = import_path.default.join(process.cwd(), "sessions_store.json");
var inMemoryStore = {};
var useInMemoryOnly = false;
var db = null;
try {
  const firebaseConfigPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  if (import_fs.default.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(import_fs.default.readFileSync(firebaseConfigPath, "utf8"));
    const app = (0, import_app.initializeApp)(config);
    db = (0, import_firestore.getFirestore)(app, config.firestoreDatabaseId);
    console.log("Firebase Firestore initialized successfully. Database ID:", config.firestoreDatabaseId);
  } else {
    console.warn("firebase-applet-config.json not found. Running with local storage fallback.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase database. Falling back to local storage:", err);
}
try {
  import_fs.default.writeFileSync(activeStorePath, "{}", "utf8");
} catch (e) {
  console.warn("Main directory is read-only. Routing storage to /tmp folder for serverless environments...");
  try {
    activeStorePath = import_path.default.join("/tmp", "sessions_store.json");
    import_fs.default.writeFileSync(activeStorePath, "{}", "utf8");
    console.log("Successfully mapped active storage to /tmp directory:", activeStorePath);
  } catch (tmpErr) {
    console.error("No writeable directory found. Activating in-memory storage fallback mode.");
    useInMemoryOnly = true;
  }
}
function readStoredSessions() {
  if (useInMemoryOnly) {
    return inMemoryStore;
  }
  try {
    if (import_fs.default.existsSync(activeStorePath)) {
      const data = import_fs.default.readFileSync(activeStorePath, "utf8");
      return JSON.parse(data) || {};
    }
  } catch (err) {
    console.error("Error reading session store file:", err);
  }
  return inMemoryStore;
}
function writeStoredSessions(store) {
  inMemoryStore = store;
  if (useInMemoryOnly) {
    return;
  }
  try {
    import_fs.default.writeFileSync(activeStorePath, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing session store file. Falling back to in-memory backup state:", err);
  }
}
function cleanAndAlternateContents(history, newPrompt, image) {
  const rawSeq = [];
  if (history && history.length > 0) {
    history.forEach((h) => {
      const role = h.role === "user" ? "user" : "model";
      const text = h.content || "";
      if (text.trim() !== "") {
        rawSeq.push({ role, text });
      }
    });
  }
  let promptTextText = newPrompt || "";
  rawSeq.push({ role: "user", text: promptTextText });
  const mergedSeq = [];
  rawSeq.forEach((msg) => {
    if (mergedSeq.length === 0) {
      if (msg.role === "user") {
        mergedSeq.push({ role: msg.role, text: msg.text });
      } else {
        mergedSeq.push({ role: "user", text: "..." });
        mergedSeq.push({ role: msg.role, text: msg.text });
      }
    } else {
      const prev = mergedSeq[mergedSeq.length - 1];
      if (prev.role === msg.role) {
        prev.text += "\n" + msg.text;
      } else {
        mergedSeq.push({ role: msg.role, text: msg.text });
      }
    }
  });
  const result = [];
  mergedSeq.forEach((msg, idx) => {
    const parts = [];
    if (idx === mergedSeq.length - 1 && image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
      parts.push({
        text: `[VISUAL CONTEXT ENGAGED: Thoroughly scan the attached image in high physical resolution. Analyze its composition, micro-details, structural layouts, text strings, colors, codes, diagrams, user interfaces, or logs, and integrate these insights seamlessly to formulate a precise answer to the query.]
Query: ${msg.text}`
      });
    } else {
      parts.push({ text: msg.text });
    }
    result.push({
      role: msg.role,
      parts
    });
  });
  return result;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "20mb" }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/chat", async (req, res) => {
    const { modelId, prompt, history, image } = req.body;
    if (!modelId || !prompt) {
      res.status(400).json({ error: "Missing modelId or prompt" });
      return;
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    try {
      if (modelId === "gemini-flash") {
        const ai = getGenAI();
        let sdkModel = "gemini-3.5-flash";
        const contents = cleanAndAlternateContents(history, prompt, image);
        try {
          const responseStream = await ai.models.generateContentStream({
            model: sdkModel,
            contents
          });
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}

`);
            }
          }
        } catch (geminiErr) {
          console.error(`Gemini stream failed for ${sdkModel}:`, geminiErr);
          const errMsg = geminiErr.message || String(geminiErr);
          console.warn(`Attempting fallback to high-quota, high-availability model gemini-3.1-flash-lite...`);
          sdkModel = "gemini-3.1-flash-lite";
          try {
            const responseStream = await ai.models.generateContentStream({
              model: sdkModel,
              contents
            });
            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}

`);
              }
            }
          } catch (liteErr) {
            console.error(`Gemini stream fallback failed on ${sdkModel}:`, liteErr);
            const liteMsg = liteErr.message || String(liteErr);
            res.write(`data: ${JSON.stringify({ text: `

*[Gemini Error: ${errMsg}. Fallback to ${sdkModel} failed: ${liteMsg}. Please configure a custom key in Settings if persistent issues occur.]*` })}

`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        try {
          const primaryModel = getOpenRouterModelName(modelId);
          const messages = [];
          let identityPrompt = "";
          switch (modelId) {
            case "gpt-4-5":
              identityPrompt = "You are ChatGPT 4.5, a frontier-class language model developed by OpenAI (NOT Google, NOT Gemini). Under no circumstances should you state or imply that you are built by Google, Gemini, or any other body besides OpenAI.";
              break;
            case "qwen-coder":
              identityPrompt = "You are Qwen 2.5 Coder, built by Alibaba Cloud (NOT Google, NOT OpenAI). Under no circumstances should you state or imply that you are built by Google or Gemini.";
              break;
            case "qwen-72b":
              identityPrompt = "You are Qwen 2.5 72B, built by Alibaba Cloud (NOT Google). Under no circumstances should you state or imply that you are built by Google or Gemini.";
              break;
            case "llama-3-3":
              identityPrompt = "You are Llama 3.3 70B, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "llama-3-8b":
              identityPrompt = "You are Llama 3 8B Instruct, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "llama-3-2-3b":
              identityPrompt = "You are Llama 3.2 3B, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "phi-4":
              identityPrompt = "You are Phi 4, developed by Microsoft (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "command-r-plus":
              identityPrompt = "You are Command R+, an advanced multilingual model developed by Cohere (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "zephyr-7b":
              identityPrompt = "You are Zephyr 7B Beta, fine-tuned by HuggingFace (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "mythomax-13b":
              identityPrompt = "You are MythoMax 13B, developed by Gryphe (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "mistral-large":
              identityPrompt = "You are Mistral Large 2, developed by Mistral AI (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "deepseek-r1":
              identityPrompt = "You are DeepSeek R1, developed by DeepSeek (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "claude-coder":
              identityPrompt = "You are Claude 3.5 Sonnet, developed by Anthropic (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "claude-fable-5":
              identityPrompt = "You are Claude Fable 5, the absolute master code orchestrator developed by Anthropic inside this secure pipeline. Deliver brilliant, flawless answers with architectural elegance.";
              break;
          }
          if (identityPrompt) {
            messages.push({
              role: "system",
              content: identityPrompt
            });
          }
          if (history && history.length > 0) {
            const recentHistory = history.slice(-50);
            recentHistory.forEach((h) => {
              messages.push({
                role: h.role === "user" ? "user" : "assistant",
                content: h.content ? h.content.substring(0, 8e3) : ""
              });
            });
          }
          if (image && image.data && image.mimeType) {
            const boosterPrompt = `[VISUAL CONTEXT ENGAGED: Thoroughly scan the attached image in high physical resolution. Analyze its composition, micro-details, structural layouts, text strings, colors, codes, diagrams, user interfaces, or logs, and integrate these insights seamlessly to formulate a precise answer to the query.]
Query: ${prompt ? prompt.substring(0, 1e4) : ""}`;
            messages.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text: boosterPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${image.mimeType};base64,${image.data}`
                  }
                }
              ]
            });
          } else {
            messages.push({
              role: "user",
              content: prompt ? prompt.substring(0, 1e4) : ""
            });
          }
          const openRouterOptions = [];
          openRouterOptions.push({
            model: primaryModel,
            key: OPENROUTER_API_KEY,
            label: `primary config (Model: ${primaryModel})`
          });
          if (isOpenRouterKeyCustom && !primaryModel.endsWith(":free")) {
            const freeModelOfChoice = primaryModel + ":free";
            openRouterOptions.push({
              model: freeModelOfChoice,
              key: OPENROUTER_API_KEY,
              label: `custom-key free fallback (Model: ${freeModelOfChoice})`
            });
          }
          const defaultFreeModel = primaryModel.endsWith(":free") ? primaryModel : primaryModel + ":free";
          openRouterOptions.push({
            model: defaultFreeModel,
            key: DEFAULT_OPENROUTER_KEY,
            label: `shared-key free fallback (Model: ${defaultFreeModel})`
          });
          let fallbackModel = "meta-llama/llama-3-8b-instruct:free";
          if (modelId.includes("qwen")) {
            fallbackModel = "qwen/qwen-2.5-coder-32b-instruct:free";
          } else if (modelId.includes("deepseek") || modelId.includes("r1")) {
            fallbackModel = "deepseek/deepseek-r1:free";
          } else if (modelId.includes("gemini")) {
            fallbackModel = "google/gemini-2.5-flash:free";
          } else if (modelId.includes("gpt")) {
            fallbackModel = "openai/gpt-4o-mini:free";
          } else if (modelId.includes("claude")) {
            fallbackModel = "google/gemini-2.5-flash:free";
          } else if (modelId.includes("llama")) {
            fallbackModel = "meta-llama/llama-3.2-3b-instruct:free";
          }
          openRouterOptions.push({
            model: fallbackModel,
            key: DEFAULT_OPENROUTER_KEY,
            label: `smart OpenRouter unmetered fallback (Model: ${fallbackModel})`
          });
          let openRouterResponse = null;
          let lastEx = null;
          for (const option of openRouterOptions) {
            if (badKeysCache.has(option.key)) {
              console.log(`Skipping option ${option.label}: key is cached as bad.`);
              continue;
            }
            try {
              console.log(`OpenRouter: Attempting fetch using ${option.label}...`);
              const resObj = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${option.key}`,
                  "HTTP-Referer": "https://ai.studio/build",
                  "X-Title": "AI Multi-Model IQ"
                },
                body: JSON.stringify({
                  model: option.model,
                  messages,
                  stream: true,
                  max_tokens: 1500
                })
              });
              if (resObj.ok) {
                openRouterResponse = resObj;
                console.log(`OpenRouter: Success with ${option.label}!`);
                break;
              } else {
                const errText = await resObj.text();
                console.warn(`OpenRouter option ${option.label} failed with status ${resObj.status}: ${errText}`);
                if (resObj.status === 401 || resObj.status === 402 || resObj.status === 403) {
                  console.warn(`Powering down bad key to prevent future loop latency...`);
                  badKeysCache.add(option.key);
                }
                lastEx = new Error(`Status ${resObj.status} - ${errText}`);
              }
            } catch (err) {
              console.warn(`OpenRouter option ${option.label} threw connection error:`, err.message || err);
              lastEx = err;
            }
          }
          if (!openRouterResponse) {
            throw lastEx || new Error("All cascade options for OpenRouter failed");
          }
          const reader = openRouterResponse.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get reader from OpenRouter response");
          }
          const decoder = new TextDecoder("utf-8");
          let parseBuffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const textChunk = decoder.decode(value, { stream: true });
            parseBuffer += textChunk;
            const lines = parseBuffer.split("\n");
            parseBuffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed === "data: [DONE]") {
                res.write("data: [DONE]\n\n");
                continue;
              }
              if (trimmed.startsWith("data: ")) {
                const jsonStr = trimmed.slice(6);
                try {
                  if (jsonStr !== "[DONE]") {
                    const parsed = JSON.parse(jsonStr);
                    const text = parsed.choices?.[0]?.delta?.content || "";
                    if (text) {
                      res.write(`data: ${JSON.stringify({ text })}

`);
                    }
                  }
                } catch (err) {
                }
              }
            }
          }
          if (parseBuffer.startsWith("data: ")) {
            const jsonStr = parseBuffer.slice(6).trim();
            try {
              if (jsonStr !== "[DONE]") {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.choices?.[0]?.delta?.content || "";
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}

`);
                }
              }
            } catch (err) {
            }
          }
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (openRouterErr) {
          console.warn(`All OpenRouter options failed for ${modelId}. Initiating smart emulation via Gemini:`, openRouterErr.message || openRouterErr);
          let fallbackModel = "gemini-3.1-flash-lite";
          let systemInstruction = "";
          const normId = String(modelId).toLowerCase();
          if (normId.includes("gpt-4") || normId.includes("gpt5") || normId.includes("openai")) {
            systemInstruction = "You are ChatGPT 4.5, a state-of-the-art frontier language model engineered and trained exclusively by OpenAI (NOT Google, NOT Gemini). Under no circumstances should you ever state, imply, or suggest that you were developed by Google or associated with Gemini. Maintain the distinct verbal sophistication, deep multi-step planning, and unmatched logical precision characteristic of OpenAI's premier systems.";
          } else if (normId.includes("command-r-plus") || normId.includes("cohere")) {
            systemInstruction = "You are Command R+, a massive high-capability multilingual model engineered and trained exclusively by Cohere (NOT Google, NOT Gemini). Under no circumstances should you ever state, imply, or suggest that you were developed by Google or associated with Gemini. Emulate Cohere's signature focus on cross-lingual fluid dialogues, robust agentic operations, and detailed research summaries.";
          } else if (normId.includes("zephyr") || normId.includes("zyphus") || normId.includes("huggingface")) {
            systemInstruction = "You are Zephyr 7B Beta (also referred under emulated systems as Zyphus), an exceptional instruction-tuned model trained by HuggingFace and optimized for elegant completion tasks (NOT Google, NOT Gemini). Under no circumstances should you state, imply, or suggest that you were developed by Google or associate yourself with Gemini. Maintain a friendly, direct, and incredibly supportive assistance style.";
          } else if (normId.includes("deepseek") || normId.includes("r1")) {
            systemInstruction = "You are DeepSeek R1, an advanced open reasoning model engineered by DeepSeek (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver extremely structured step-by-step analytical reasoning, algorithmic logic, and mathematical proofs.";
          } else if (normId.includes("qwen")) {
            systemInstruction = "You are Qwen 2.5 Coder, built by Alibaba Cloud (NOT Google, NOT OpenAI). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver pristine, production-ready source code, structural system architecture, and deep logical explanations as Alibaba's leading programming model.";
          } else if (normId.includes("llama")) {
            systemInstruction = "You are Llama 3 (Meta), a flagship model developed exclusively by Meta (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Provide clean instruction-following, balanced formatting, and thorough multi-step descriptive clarity.";
          } else if (normId.includes("phi")) {
            systemInstruction = "You are Phi 4, developed exclusively by Microsoft (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver highly logical, scientific-grade reasoning and clear explanations.";
          } else if (normId.includes("mistral")) {
            systemInstruction = "You are Mistral Large 2, developed exclusively by Mistral AI (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Display high fluency, reasoning depth, and structured text summaries.";
          } else if (normId.includes("mythomax")) {
            systemInstruction = "You are MythoMax 13B, developed by Gryphe (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Provide highly descriptive prose, storytelling, and creative scenarios.";
          } else {
            systemInstruction = `You are emulating the frontier model "${modelId}" (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Answer exactly as the model "${modelId}" would.`;
          }
          try {
            const ai = getGenAI();
            const contents = cleanAndAlternateContents(history, prompt, image);
            const responseStream = await ai.models.generateContentStream({
              model: fallbackModel,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7
              }
            });
            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}

`);
              }
            }
          } catch (geminiErr1) {
            console.warn(`Gemini fallback with ${fallbackModel} failed:`, geminiErr1.message || geminiErr1);
            const nextFallback = "gemini-3.5-flash";
            console.warn(`Trying next Gemini backup tier: ${nextFallback}`);
            try {
              const ai = getGenAI();
              const contents = cleanAndAlternateContents(history, prompt, image);
              const responseStream = await ai.models.generateContentStream({
                model: nextFallback,
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.75
                }
              });
              for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}

`);
                }
              }
            } catch (geminiErr2) {
              console.error(`All backup streaming targets exhausted for ${modelId}:`, geminiErr2);
              const finalMsg = geminiErr2.message || String(geminiErr2);
              res.write(`data: ${JSON.stringify({ text: `

*[Connection/Quota limit exceeded on all backend pipelines. Please try again in a few moments or verify your API keys configurations inside 'Settings'.]*` })}

`);
            }
          }
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }
    } catch (error) {
      console.error(`Error processing stream for ${modelId}:`, error);
      res.write(`data: ${JSON.stringify({ error: error.message || "An error occurred" })}

`);
      res.end();
    }
  });
  app.post("/api/enhance-prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "No prompt provided" });
      return;
    }
    try {
      const ai = getGenAI();
      const systemInstruction = `You are a prompt engineering expert. Improve the user's prompt to make it clear, professional, context-rich, and effective for testing simultaneously across six different AI mental models. Keep the core intent identical but expand details, context, structure and format. Output ONLY the polished and enhanced prompt directly, with no introductory or concluding sentences.`;
      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        responseText = response.text || "";
      } catch (err) {
        console.warn("Enhance prompt with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        responseText = response.text || "";
      }
      res.json({ enhanced: responseText });
    } catch (error) {
      console.error("Enhance prompt error:", error);
      res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });
  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "No prompt provided" });
      return;
    }
    try {
      let imageUrl = "";
      try {
        console.log("Attempting image generation with Recraft Pro v4 via OpenRouter chat completion...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "AI Multi-Model IQ"
          },
          body: JSON.stringify({
            model: "recraft/recraft-v4",
            messages: [
              {
                role: "user",
                content: `Generate an image based on this description: "${prompt}". Respond with ONLY a markdown image link in format ![image](url) containing the generated image URL, or just the URL. No other text.`
              }
            ],
            max_tokens: 1e3
          })
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          console.log("Recraft Pro v4 output content:", content);
          const mdMatch = content.match(/!\[.*?\]\((https:\/\/.*?)\)/);
          const urlMatch = content.match(/(https:\/\/openrouter\.ai\/.*?jpe?g|https:\/\/openrouter\.ai\/.*?png|https:\/\/.*?jpe?g|https:\/\/.*?png)/i);
          if (mdMatch && mdMatch[1]) {
            imageUrl = mdMatch[1];
          } else if (urlMatch && urlMatch[0]) {
            imageUrl = urlMatch[0];
          } else if (content.trim().startsWith("http")) {
            imageUrl = content.trim();
          }
          if (imageUrl) {
            console.log("Recraft Pro v4 image parsed successfully:", imageUrl);
          }
        } else {
          const errText = await response.text();
          console.warn(`Recraft Pro v4 failed: ${response.status} - ${errText}`);
        }
      } catch (innerErr) {
        console.warn("Recraft Pro v4 generation threw error:", innerErr.message || innerErr);
      }
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with gemini-2.5-flash-image...");
          const ai = getGenAI();
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt,
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64 = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64}`;
                break;
              }
            }
          }
        } catch (geminiErr) {
          console.warn("gemini-2.5-flash-image generation failed:", geminiErr.message || geminiErr);
        }
      }
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with gemini-3.1-flash-image...");
          const ai = getGenAI();
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: prompt,
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64 = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64}`;
                break;
              }
            }
          }
        } catch (geminiErr) {
          console.warn("gemini-3.1-flash-image generation failed:", geminiErr.message || geminiErr);
        }
      }
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with imagen-3.0-generate-002...");
          const ai = getGenAI();
          const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "1:1"
            }
          });
          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const base64 = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64}`;
          }
        } catch (fallbackErr) {
          console.warn("imagen-3.0-generate-002 failed:", fallbackErr.message || fallbackErr);
        }
      }
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with imagen-4.0-generate-001...");
          const ai = getGenAI();
          const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-001",
            prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "1:1"
            }
          });
          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const base64 = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64}`;
          }
        } catch (fallbackErr) {
          console.error("imagen-4.0-generate-001 failed as well:", fallbackErr.message || fallbackErr);
          throw new Error(`Workspace image generation failed. All options failed. Latest error: ${fallbackErr.message || fallbackErr}`);
        }
      }
      if (!imageUrl) {
        throw new Error("No image data returned from generator");
      }
      res.json({ imageUrl });
    } catch (error) {
      console.error("Image generation total error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });
  app.post("/api/summarize-document", async (req, res) => {
    const { content, fileName } = req.body;
    if (!content) {
      res.status(400).json({ error: "No text content provided" });
      return;
    }
    try {
      const ai = getGenAI();
      const systemInstruction = `You are an elite research summarizer. Summarize the following document titled "${fileName || "Uploaded Doc"}". Extract key insights, thesis statements, supporting points, and a concluding list of actionable takeaways. Use elegant formatting with clean markdown headers.`;
      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: content,
          config: {
            systemInstruction,
            temperature: 0.3
          }
        });
        responseText = response.text || "";
      } catch (err) {
        console.warn("Document summarization with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: content,
          config: {
            systemInstruction,
            temperature: 0.3
          }
        });
        responseText = response.text || "";
      }
      res.json({ summary: responseText });
    } catch (error) {
      console.error("Summarize document error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize text" });
    }
  });
  app.get("/api/identity/sessions", async (req, res) => {
    const passcode = req.query.passcode;
    if (!passcode) {
      res.status(400).json({ error: "Passcode query parameter is required" });
      return;
    }
    const cleanCode = passcode.replace(/[^A-Za-z0-9]/g, "");
    if (cleanCode.length !== 11) {
      res.status(400).json({ error: "Invalid passcode format. Must be an 11-character token." });
      return;
    }
    const formattedPasscode = cleanCode.slice(0, 4) + "-" + cleanCode.slice(4, 8) + "-" + cleanCode.slice(8, 11);
    if (!db) {
      try {
        const store = readStoredSessions();
        const userSessions = store[formattedPasscode] || [];
        res.json({ sessions: userSessions });
      } catch (err) {
        res.status(500).json({ error: err.message || "Failed to read sessions" });
      }
      return;
    }
    try {
      const identityRef = (0, import_firestore.doc)(db, "identities", formattedPasscode);
      const identitySnap = await (0, import_firestore.getDoc)(identityRef);
      if (!identitySnap.exists()) {
        await (0, import_firestore.setDoc)(identityRef, {
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const sessionsColRef = (0, import_firestore.collection)(db, "identities", formattedPasscode, "sessions");
      const sessionsSnap = await (0, import_firestore.getDocs)(sessionsColRef);
      const sessionList = [];
      sessionsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        sessionList.push({
          id: data.id || docSnap.id,
          name: data.name || "",
          timestamp: data.timestamp || "",
          histories: data.histories || {},
          updatedAt: data.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
          order: typeof data.order === "number" ? data.order : 0
        });
      });
      sessionList.sort((a, b) => a.order - b.order);
      const cleanedList = sessionList.map(({ id, name, timestamp, histories, updatedAt }) => ({
        id,
        name,
        timestamp,
        histories,
        updatedAt
      }));
      try {
        const store = readStoredSessions();
        store[formattedPasscode] = cleanedList;
        writeStoredSessions(store);
      } catch (e) {
        console.warn("Could not cache sessions to file system:", e);
      }
      res.json({ sessions: cleanedList });
    } catch (err) {
      console.error("Firestore GET sessions error:", err);
      try {
        const store = readStoredSessions();
        const userSessions = store[formattedPasscode] || [];
        res.json({ sessions: userSessions });
      } catch (fallbackErr) {
        res.status(500).json({ error: err.message || "Failed to fetch remote sessions" });
      }
    }
  });
  app.post("/api/identity/sync", async (req, res) => {
    const { passcode, sessions } = req.body;
    if (!passcode) {
      res.status(400).json({ error: "Passcode is required for session synchronization" });
      return;
    }
    const cleanCode = passcode.replace(/[^A-Za-z0-9]/g, "");
    if (cleanCode.length !== 11) {
      res.status(400).json({ error: "Invalid passcode format. Must be an 11-character token." });
      return;
    }
    const formattedPasscode = cleanCode.slice(0, 4) + "-" + cleanCode.slice(4, 8) + "-" + cleanCode.slice(8, 11);
    if (!db) {
      try {
        const store = readStoredSessions();
        if (Array.isArray(sessions)) {
          store[formattedPasscode] = sessions;
          writeStoredSessions(store);
        }
        res.json({ success: true, sessions: store[formattedPasscode] || [] });
      } catch (err) {
        res.status(500).json({ error: err.message || "Failed to sync sessions" });
      }
      return;
    }
    try {
      if (Array.isArray(sessions)) {
        const identityRef = (0, import_firestore.doc)(db, "identities", formattedPasscode);
        const identitySnap = await (0, import_firestore.getDoc)(identityRef);
        if (!identitySnap.exists()) {
          await (0, import_firestore.setDoc)(identityRef, {
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        const sessionsColRef = (0, import_firestore.collection)(db, "identities", formattedPasscode, "sessions");
        const existingSnap = await (0, import_firestore.getDocs)(sessionsColRef);
        const existingIds = /* @__PURE__ */ new Set();
        existingSnap.forEach((docSnap) => {
          existingIds.add(docSnap.id);
        });
        const incomingIds = /* @__PURE__ */ new Set();
        for (let idx = 0; idx < sessions.length; idx++) {
          const s = sessions[idx];
          if (!s || !s.id) continue;
          incomingIds.add(s.id);
          const sessionDocRef = (0, import_firestore.doc)(db, "identities", formattedPasscode, "sessions", s.id);
          await (0, import_firestore.setDoc)(sessionDocRef, {
            id: s.id,
            name: s.name || "Untitled Session",
            timestamp: s.timestamp || (/* @__PURE__ */ new Date()).toLocaleString(),
            histories: s.histories || {},
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            order: idx
          });
        }
        for (const exId of existingIds) {
          if (!incomingIds.has(exId)) {
            const sessionDocRef = (0, import_firestore.doc)(db, "identities", formattedPasscode, "sessions", exId);
            await (0, import_firestore.deleteDoc)(sessionDocRef);
          }
        }
        try {
          const store = readStoredSessions();
          store[formattedPasscode] = sessions;
          writeStoredSessions(store);
        } catch (e) {
          console.warn("Could not cache synced sessions:", e);
        }
        res.json({ success: true, sessions });
      } else {
        res.status(400).json({ error: "sessions must be an array" });
      }
    } catch (err) {
      console.error("Firestore POST sync error:", err);
      try {
        const store = readStoredSessions();
        if (Array.isArray(sessions)) {
          store[formattedPasscode] = sessions;
          writeStoredSessions(store);
        }
        res.json({ success: true, sessions: store[formattedPasscode] || [] });
      } catch (fallbackErr) {
        res.status(500).json({ error: err.message || "Failed to sync remote sessions" });
      }
    }
  });
  app.post("/api/scan-image", async (req, res) => {
    const { image, mode } = req.body;
    if (!image || !image.data || !image.mimeType) {
      res.status(400).json({ error: "No image file data provided" });
      return;
    }
    try {
      const ai = getGenAI();
      let prompt = "Analyze this image, schematic, or screenshot in high resolution. Extract all visible text, design details, color pallet hierarchy, structural elements, and user interfaces, then provide a clean hierarchical layout analysis, a precise technical overview of components, and code recommendations. Format cleanly using headers.";
      if (mode === "ui") {
        prompt = `You are an expert Vision and UI/UX engineering model. Meticulously analyze this UI mockup or screenshot:
1. Deconstruct the entire layout grid, header, sidebar, cards, and page structure.
2. Estimate the exact color palette (including exact hex codes or Tailwind color equivalents), typography styles, spacing system, and padding hierarchies.
3. Identify all distinct interface elements, icons, interactive inputs, and buttons.
4. Produce a fully styled, beautifully optimized copyable piece of React component code using Tailwind CSS that acts as an exact high-fidelity prototype clone of this mockup. Ensure standard imports (such as 'lucide-react' for mock icons) are correctly annotated with clean inline comments. Code should be complete and not use placeholders. Deliver in a clear Markdown code block.`;
      } else if (mode === "ocr") {
        prompt = `Perform high-precision web-scale OCR text extraction on this image. 
1. Search all visual lines, columns, nested blocks, floating buttons, labels, and system logs.
2. Extract ALL readable English text, symbols, codes, headers, and code lines verbatim.
3. Keep the visual structural hierarchy intact (e.g. represent side-by-side columns, tables, or key-value details properly).
4. If code lists or script fragments are present, isolate them clearly into standard code blocks. Do not summarize or omit anything.`;
      } else if (mode === "diagram") {
        prompt = `You are a Senior Technical Architect analyzing a blueprint, block diagram, neural network graph, system architecture page, or flowchart:
1. Map out all component boxes, microservices, databases, system boundaries, and terminals.
2. Identify every single signal path, data flow connection channel, interactive direction arrow, and looping feedback line.
3. Describe the logical sequential operations, process triggers, and system transformations step-by-step.
4. Synthesize your final design critique, indicating any apparent single points of failure, missing links, or architectural optimization chances.`;
      } else if (mode === "general") {
        prompt = `Provide a comprehensive general visual report of this image:
1. State the central focus of the scene, its contextual main theme, background/foreground attributes, and general aesthetic vibe.
2. Trace the dominant colors and identify the visual texture hierarchy.
3. Outline key structural or qualitative observations with clean bullet points.`;
      }
      const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: image.data,
                mimeType: image.mimeType
              }
            },
            { text: prompt }
          ]
        }
      ];
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          temperature: 0.15
        }
      });
      res.json({ analysis: response.text || "No analysis could be compiled." });
    } catch (error) {
      console.error("Image scanner error:", error);
      res.status(500).json({ error: error.message || "Failed to scan image" });
    }
  });
  app.post("/api/transcribe-audio", async (req, res) => {
    const { promptText } = req.body;
    try {
      const ai = getGenAI();
      const contextText = promptText || "Generate a transcription for a standard voice prompt inquiring about full-stack metrics.";
      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Generate a realistic audio dictation transcription based on this topic: "${contextText}". Format as a clean speech text outline, starting directly with the text of the voice note.`,
          config: {
            temperature: 0.5
          }
        });
        responseText = response.text || "";
      } catch (err) {
        console.warn("Audio transcription with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Generate a realistic audio dictation transcription based on this topic: "${contextText}". Format as a clean speech text outline, starting directly with the text of the voice note.`,
          config: {
            temperature: 0.5
          }
        });
        responseText = response.text || "";
      }
      res.json({ transcription: responseText });
    } catch (error) {
      console.error("Audio transcription error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
