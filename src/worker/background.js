/**
 * Background Script with Keep-Alive Mechanism
 * 
 * This script implements a keep-alive mechanism to prevent the service worker
 * from being terminated prematurely. It uses chrome.alarms to periodically
 * wake up the service worker.
 */

// 创建持久连接以保持Service Worker活跃
let keepAliveIntervalId = null;

// 启动保持活跃机制
function startKeepAlive() {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
  }
  
  // 使用chrome.alarms创建定期唤醒
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.2 }); // 每12秒触发一次
  
  console.log('Keep-alive mechanism started');
}

// 停止保持活跃机制
function stopKeepAlive() {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
  }
  
  chrome.alarms.clear('keepAlive');
  console.log('Keep-alive mechanism stopped');
}

// 监听alarms事件
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // 执行一些轻量级操作以保持Service Worker活跃
    chrome.storage.local.get(null, () => {
      if (chrome.runtime.lastError) {
        console.log('Keep-alive alarm triggered, but storage access failed');
      } else {
        console.log('Keep-alive alarm triggered and handled');
      }
    });
  }
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Background script installed');
  startKeepAlive();
});

// 监听扩展启动事件
chrome.runtime.onStartup.addListener(() => {
  console.log('Background script started');
  startKeepAlive();
});

// 监听连接事件，保持长连接
chrome.runtime.onConnect.addListener((port) => {
  console.log('Content script connected to background');
  
  port.onMessage.addListener((msg) => {
    console.log('Message received from content script:', msg);
    // 处理来自内容脚本的消息
    try {
      port.postMessage({ type: 'ack', payload: { received: true } });
    } catch (error) {
      console.error('Failed to send message back to content script:', error);
    }
  });
  
  port.onDisconnect.addListener(() => {
    console.log('Content script disconnected');
    if (chrome.runtime.lastError) {
      console.log('Port disconnected due to error:', chrome.runtime.lastError.message);
    }
  });
});

// 监听消息事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message, 'from sender:', sender);
  
  // 使用try-catch包装消息处理，避免context销毁时报错
  try {
    // 处理ping消息
    if (message.type === 'ping') {
      sendResponse({ ok: true, data: { message: 'pong' } });
      return true;
    }
    
    // 其他消息类型可以在这里处理
    sendResponse({ ok: false, error: { code: 'UNKNOWN_MESSAGE', message: 'Unknown message type' } });
  } catch (error) {
    console.error('Error handling message:', error);
    // 即使出错也要尝试发送响应
    try {
      sendResponse({ ok: false, error: { code: 'MESSAGE_ERROR', message: error.message } });
    } catch (sendError) {
      console.error('Failed to send error response:', sendError);
    }
  }
  
  // 保持消息通道开放以支持异步响应
  return true;
});

// Service Worker生命周期事件
self.addEventListener('install', (event) => {
  console.log('Background Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Background Service Worker activating...');
  event.waitUntil(self.clients.claim());
  startKeepAlive();
});

console.log('Background script loaded with keep-alive mechanism');