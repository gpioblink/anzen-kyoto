const LINEAPI_TOKEN = process.env.LINEAPI_TOKEN;
const REPLY_URL = process.env.REPLY_URL;

const prompt = `
#introduction
入力を「京ことば」と呼ばれる遠回しな言い方に置き換えてください。

#conditions
userからの入力を、京言葉に言い換えてください。
言葉に返答するのではなく、言い換えにとどめること。
文句や愚痴などについても同様に変換しますが、直接的ではなく、間接的に、マイナス表現を使用せずに変換してください。
商品名などの固有名は、そのまま用法で使用してください。
##口調
「〇〇はりますなぁ」や「〇〇どうなぁ」のような口調を使う。
##京ことばとは


返答は、元の文章を含めず、結果だけを返してください。また、返答には「」を含めないでください。
`

const OPENAI_APIKEY = process.env.OPENAI_APIKEY;


function doPost(e) {
  console.log("スタート");
  // イベントデータはJSON形式となっているため、parseして取得
  const eventData = JSON.parse(e.postData.contents).events[0]
    , repToken = eventData.replyToken
    , msgType = eventData.message.type;
  console.log("データ読み込み完了");
  // テキストメッセージのときのみ
  if (msgType == 'text') {
    console.log("テキストが投げられた。GPT投げます。")
    let uText = eventData.message.text;
    console.log(uText);
    if (uText == "!menu1" || uText == "!menu2") {
      replyTxt(repToken, "メニューが押されました！これはGPTからの返答ではありません。");
    }
    else {
      logging("user", uText);
      let result = sendToChatGPT(uText);
      logging("assistant", result);
      replyTxt(repToken, result);
    }
  }
}


function replyTxt(token, txt) {
  txt = txt.replace("「", "");
  txt = txt.replace("」", "");
  const message = {
    'replyToken': token,
    'messages': [{
      'type': 'text',
      'text': txt,
      /*sender": {
        "name": "Cony",
        "iconUrl": "https://static.wikia.nocookie.net/line/images/1/10/2015-cony.png"
      }*/
    }]
  }
    , options = {
      'method': 'post',
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + LINEAPI_TOKEN,
      },
      'payload': JSON.stringify(message)
    };
  UrlFetchApp.fetch(REPLY_URL, options);
}

function sendToChatGPT(userInput) {
  console.info("ChatGPTに送信開始")
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  try {
    //スクリプトプロパティに設定したOpenAIのAPIキーを取得
    //ChatGPTのAPIのエンドポイントを設定
    //ChatGPTに投げるメッセージを定義(過去のやり取りも含めた形)
    var messages = promptmaker(userInput);
  }
  catch (e) {
    console.log(e)
    return e;
  }

  //OpenAIのAPIリクエストに必要なヘッダー情報を設定
  const headers = {
    Authorization: "Bearer " + OPENAI_APIKEY,
    "Content-type": "application/json",
  };
  //ChatGPTモデルやトークン上限、プロンプトをオプションに設定
  const options = {
    muteHttpExceptions: true,
    headers: headers,
    method: "POST",
    payload: JSON.stringify({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }),
  };
  //OpenAIのChatGPTにAPIリクエストを送り、結果を変数に格納
  const response = JSON.parse(
    UrlFetchApp.fetch(apiUrl, options).getContentText()
  );
  console.log(response);
  //ChatGPTのAPIレスポンスをログ出力
  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}

const sheet_url = "https://docs.google.com/spreadsheets/d/1YmQlOf57JBg996dUBIP1ojBApiXzMs5VcDNm_QrYUfw/edit#gid=0";


function logging(role, message) {
  const spreadSheet = SpreadsheetApp.openByUrl(sheet_url);
  const sheet = spreadSheet.getSheetByName("Sheet1");
  let low = sheet.getLastRow();
  sheet.getRange(low + 1, 1).setValue(role);
  sheet.getRange(low + 1, 2).setValue(message);
}

function promptmaker(userInput) {
  var prompt_and_examples = [
    {
      "role": "system", "content": prompt
    }
  ]
  const system_instruction = {
    "role": "system",
    "content": "上記は変換の結果の一例です。こちらを参考に、変換を行ってください。"
  }
  const userinputjson = {
    "role": "system", "content": userInput
  }
  const examples_sheet = SpreadsheetApp.openByUrl(sheet_url).getSheetByName("examples");
  var n = 1;
  while (true) {
    var prompt_user = examples_sheet.getRange(n, 1).getValue();
    var prompt_assistant = examples_sheet.getRange(n, 2).getValue();
    if (isValid(prompt_user)) {
      prompt_and_examples.push({ "role": "user", "content": prompt_user });
      prompt_and_examples.push({ "role": "assistant", "content": prompt_assistant });
      n++;
    }
    else {
      break;
    }
  }
  prompt_and_examples.push(system_instruction);
  prompt_and_examples.push(userinputjson);
  console.log(prompt_and_examples);
  return prompt_and_examples;
}


function isValid(check) {
  if (check == undefined || check == "" || check == null) {
    return false;
  }
  else {
    return true;
  }
}

