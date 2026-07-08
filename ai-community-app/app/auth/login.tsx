// app/auth/login.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      {/* 品牌標題與 Icon 意象 */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Aî 智慧社區服務平台</Text>
        <Text style={styles.subText}>— 智慧管家，一站搞定生活大小事 —</Text>
      </View>

      {/* 登入區塊 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>使用 uniopen 帳號登入</Text>
        <Text style={styles.cardDesc}>整合零售、物流、餐飲、生活，單一帳號免切換 App。</Text>

        {/* 模擬快捷一鍵授權登入 (例如整合 OP APP 平台代號 01) */}
        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Text style={styles.buttonText}>OpenPî / uniopen 一鍵授權登入</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  subText: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
  cardDesc: { fontSize: 13, color: '#777', lineHeight: 20, textAlign: 'center', marginBottom: 25 },
  loginButton: { backgroundColor: '#FF5722', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});