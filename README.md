# Notion Flashcard Generator

This script automates the process of adding flashcards as toggle blocks to a Notion page. It reads a JSON file containing a list of question-answer objects and appends them to the page using the Notion API.

## Features
- Converts JSON question-answer pairs into Notion toggle blocks.
- Supports Markdown formatting for answers.

## Prerequisites
- Node.js >=18.3.0.
- A Notion integration with an API key (can be generated in Notion settings).

## Installation
1. Clone this repository or download the script.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a .env file and add your Notion API key and Page ID:
   ```sh
   NOTION_KEY=your_notion_api_key
   PAGE_ID=your_notion_page_id
   ```
   Alternatively, these can be passed as arguments when running the script.

## Usage
Run the script with the following command:
```sh
node script.js FILE [-p PAGE_ID] [-k NOTION_KEY] [-h]
```

### Arguments
- `FILE` (required): Path to the JSON file containing question-answer pairs.
- `-p, --pageId` (optional): Notion Page ID where flashcards will be added (overrides `.env`).
- `-k, --notionKey` (optional): Notion API Key (overrides `.env`).
- `-h, --help`: Show usage information.

### JSON File Format
Ensure your JSON file follows this structure:
```json
[
  { "q": "What is JavaScript?", "a": "JavaScript is a programming language used for *web development*.", "m": true },
  { "q": "What is Node.js?", "a": "Node.js is a runtime environment that allows executing JavaScript outside the browser.", "m": false }
]
```
- `q`: Question text.
- `a`: Answer text.
- `m`: (Optional) Boolean indicating if Markdown is used in the answer.

If successful, the script will print a link to the updated Notion page.

