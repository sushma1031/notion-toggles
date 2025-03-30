require("dotenv").config();
const {parseArgs} = require("node:util");
const {readFileSync} = require("node:fs")
const { Client } = require("@notionhq/client");
const markdownIt = require("markdown-it");
const { extname } = require("node:path");

function parseJSONFile (path) {
  try {
    let data = readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    exitErr(err.toString());
  }
}

async function addToggle (notion, pageId, toggleBlocks){
  await notion.blocks.children.append({
    block_id: pageId,
    children: toggleBlocks,
  });
}

function mdToRichText (text) {
  const tokens = md.parseInline(text, {})[0].children;
  let richText = [];
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (t.type === "text") {
      richText.push({ text: { content: t.content } });
    } else if (t.type === "code_inline") {
      richText.push({
        text: { content: t.content }, annotations: { code: true }
      });
    } else if (t.type === "em_open" || t.type === "strong_open" || t.type === "s_open") {
      let nextT = tokens[i + 1];
      if (nextT && nextT.type === "text")
        richText.push({ text: { content: nextT.content }, annotations: {[annotationMap[t.tag]]: true} });
      i++; //to skip the next token (text) since it's already handled
    } else if (t.type === "link_open") {
      let href = t.attrs[0][1];
      let nextT = tokens[i + 1];
      if (nextT && nextT.type === "text")
        richText.push({
          type: "text", text: { content: nextT.content, link: { url: href }}, plain_text: nextT.content, href,
        })
      i++;
    }
  };
  return richText;
}

function createToggleBlock(ques, ans, hasMarkdown=false) {
  ans = hasMarkdown ? mdToRichText(ans) : [{ text: { content: ans || '' } }];
  
  return {
    toggle: {
      rich_text: [
        {
          text: {
            content: ques,
          },
        },
      ],
      children: ans ? [
        {
          type: "paragraph",
          paragraph: {
            rich_text: ans
          },
        },
      ] : null,
    },
  };
}

const exitErr = (msg) => {
  console.error(msg);
  process.exit(1);
}

if (process.argv.length < 3) {
  exitErr("usage: node script.js FILE [-p PAGE_ID] [-k NOTION_KEY] [-m] [-h]");
}

const options = {
  notionKey: {
    type: "string",
    short: "k",
  },
  pageId: {
    type: "string",
    short: "p",
  },
  help: {
    type: "boolean",
    short: "h"
  }
};

let values;
try {
  ({ values } = parseArgs({ options, allowPositionals: true }));
} catch (error) {
  exitErr(`Error: ${error.message.split('.')[0]}`)
}
if (values.help) {
  console.log(`
    usage: node script.js FILE [-p PAGE_ID] [-k NOTION_KEY] [-h]
    positional arguments:
        FILE                path to JSON file
    options:
        -h, --help          show this help message and exit
        -k, --notionKey     Notion integration API secret. Can generate this in Notion settings.
        -p, --pageId        ID of the Notion page to be modified. Can be found as 32-char string in page URL.`
  );
  process.exit(0);
}

let file = process.argv[2];
if (extname(file) != ".json") exitErr("Error: Please provide a JSON file.")

let notionKey, pageId;
pageId = values.pageId || process.env.PAGE_ID;
notionKey = values.notionKey || process.env.NOTION_KEY;
if(!pageId || !notionKey) exitErr("Missing: Notion authentication key or page ID");

if (pageId.length !== 32) exitErr("Error: Invalid page ID");

const notion = new Client({ auth: notionKey });
const data = parseJSONFile(file);

const annotationMap = {"strong": "bold", "em": "italic", "s": "strikethrough"}
md = new markdownIt()
const toggles = data.map((e) => {
  return createToggleBlock(e.q, e.a, e.m)
})
addToggle(notion, pageId, toggles)
  .then(() => console.log(`Successful: https://www.notion.so/${pageId}`))
  .catch((err) => exitErr(err.message));