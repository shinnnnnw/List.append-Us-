import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// 定義聊天訊息的型態
interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export default function AIDashboard() {
  const { user } = useAuth(); // 撈取當前 uniopen 登入的使用者[cite: 2]
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。今天晚上想吃火鍋，順便叫人來整理家裡嗎？' } // 結合情境
  ]);

  // 生活大服務快捷按鈕定義[cite: 1]
  const services = [
    { name: '外送', formId: '6', color: '#FF5722' },
    { name: '訂位', formId: '1', color: '#4CAF50' }, // 餐廳訂位對應 form_id: 1[cite: 2]
    { name: '清潔', formId: '3', color: '#2196F3' }, // 社區服務(家事清潔)對應 form_id: 3[cite: 2]
    { name: '修繕', formId: '3', color: '#FFC107' }, 
    { name: '宅配', formId: '4', color: '#9C27B0' },
    { name: '購物', formId: '2', color: '#E91E63' }, // 商品購買對應 form_id: 2[cite: 2]
  ];

  // 發送訊息按鈕事件
  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 模擬 AI 辨識意圖並推薦彈性表單[cite: 1]
    setTimeout(() => {
      let replyText = '收到您的需求，正在為您媒合社區服務...';
      let targetFormId = '3'; // 預設跳轉到社區表單

      if (inputText.includes('吃') || inputText.includes('訂位') || inputText.includes('餐廳')) {
        replyText = '辨識到您有餐廳訂位需求，已為您產生專屬留資表單，請點擊下方按鈕填寫確認。';
        targetFormId = '1';
      } else if (inputText.includes('買') || inputText.includes('購物')) {
        replyText = '辨識到您有商品採買需求，已為您產生動態需求表單。';
        targetFormId = '2';
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }]);
      
      // 模擬智慧引導，AI 直接幫忙導向對應的動態留資表單頁[cite: 1]
      alert(`AI 智慧引導：即將為您切換至彈性留資表單 (Form ID: ${targetFormId})`);
      // router.push(`/form/${targetFormId}`); // 之後啟用動態路由用
    }, 1200);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* 上方狀態/點數回饋列 */}
      {/* 修改後：會根據你登入的帳號，動態呈現對應的歡迎詞 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>嗨，{user?.name || '住戶'}！AI 智慧管家在線上</Text>
        <Text style={styles.pointsText}>累積點數: 50 P</Text> 
      </View>

      {/* 快捷服務專區 (生活六大服務) */}
      <Text style={styles.sectionTitle}>一站搞定生活大小事</Text>
      <View style={styles.serviceGrid}>
        {services.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.serviceButton, { backgroundColor: item.color + '15' }]}
            onPress={() => alert(`即將前往 ${item.name} 需求單`)}
          >
            <Text style={[styles.serviceText, { color: item.color }]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 對話大廳流 */}
      <ScrollView style={styles.chatContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 底部輸入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="輸入您的生活需求... (例如：我想訂明天晚上的餐廳)"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>發送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  pointsText: { color: '#FFF9C4', fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginHorizontal: 15, marginTop: 15, color: '#333' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  serviceButton: { width: '31%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  serviceText: { fontSize: 14, fontWeight: 'bold' },
  chatContainer: { flex: 1, paddingHorizontal: 15 },
  messageBubble: { padding: 12, borderRadius: 12, marginVertical: 6, maxWidth: '80%' },
  userBubble: { backgroundColor: '#4CAF50', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#E0E0E0' },
  userText: { color: '#fff', fontSize: 15 },
  aiText: { color: '#333', fontSize: 15, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  input: { flex: 1, height: 40, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 15, backgroundColor: '#FAFAFA', marginRight: 10 },
  sendButton: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});