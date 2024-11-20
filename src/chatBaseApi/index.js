import service from './http.js'
import api from './api.js'
import Cookies from 'js-cookie'

const baseUrl = 'https://www.chatbase.co'
const zhipuBaseUrl = 'https://open.bigmodel.cn/api/paas/v3/model-api'

function handleTextValue(str, content, sectionIndex) {
  if(!str) return { content, sectionIndex }

  const _nIndex = str.indexOf('\n')

  if(_nIndex > -1) {
    content[sectionIndex] += str.substring(0, _nIndex + 1)
    sectionIndex ++;
    content[sectionIndex] = str.substring(_nIndex, str.length)
  } else {
    content[sectionIndex] += str;
  }
  return { content, sectionIndex }
}

async function handleSteamRes (response, callBack, preFormat, type) {
  if (!response.ok) {
    const errorData = await response.json();
    throw Error(errorData.message);
  }

  const data = response.body;

  if (!data) {
    // error happened
  }
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let sectionIndex = 0;
  let content = preFormat ? [''] : '';
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;

    if(typeof callBack == 'function') {
      let str = decoder.decode(value);
      if(type == 'zhipu') {
        str = str.split('data:');
        str = str[str.length - 1]
      }
      if(preFormat) {
        const textRes = handleTextValue( str, content, sectionIndex)
        sectionIndex = textRes.sectionIndex;
        content = textRes.content;
        callBack(content, done)
      } else {
        // str = str.replace(/\n/g, '');
        callBack(str, done)
      }
    }
  }
}

function getBaseParams () {
  return {
    stream: true,
    temperature: 0.2,
    conversationId: 'chatbase_' + Cookies.get('userId'),
    chatbotId: 'DJDeRijYuZsSgoGwHqTmt',
  };
}

// ai粗略解答
export async function v1Chat(data, callBack) {
  const url = baseUrl + api.v1Chat;
  const response = await service.fetchPost(url, { ...getBaseParams(), ...data }, { repeatCount: 3 });
  return await handleSteamRes(response, callBack)
}

// ai精确解答
export async function precisionV1Chat(data, callBack, preFormat=true) {
  const url = baseUrl + api.v1Chat;
  const response = await service.fetchPost(url, { ...getBaseParams(), ...data }, { repeatCount: 3 });
  return await handleSteamRes(response, callBack, preFormat)
}

function zhiPuBaseParams () {
  return {
    temperature: 0.2,
    top_p: 0.2
  };
}

export async function polishChatGLMPro (data, Authorization, callBack) {
  const url = zhipuBaseUrl + '/chatglm_pro' + '/sse-invoke'
  const response = await service.fetchPost(url, { ...zhiPuBaseParams(), ...data }, { 
    repeatCount: 3, 
    headers: { 
      Authorization,
      'Content-Type': 'application/json',
      'accept': 'text/event-stream'
    },
  });
  return await handleSteamRes(response, callBack, false, 'zhipu')
}