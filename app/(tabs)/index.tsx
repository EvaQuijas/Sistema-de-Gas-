import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Vibration,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';

// Colores definidos
const COLORS = {
  background: '#F5F5DC', // Beige
  accent: '#87CEEB',     // Azul claro
  low: '#4CAF50',        // Verde
  medium: '#FFEB3B',     // Amarillo
  high: '#F44336',       // Rojo
  text: '#333333',
  white: '#FFFFFF',
};

// Rangos de gas (valores de ejemplo en PPM)
const GAS_RANGES = {
  low: { max: 100, color: COLORS.low, label: 'BAJO' },
  medium: { max: 500, color: COLORS.medium, label: 'MEDIO' },
  high: { max: 1000, color: COLORS.high, label: 'ALTO' },
};

const GasSensorApp = () => {
  // Estados de la aplicación
  const [gasLevel, setGasLevel] = useState(0);
  const [alarmActive, setAlarmActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRange, setCurrentRange] = useState('low');

  // Determinar el rango actual basado en el nivel de gas
  const getGasRange = (level) => {
    if (level <= GAS_RANGES.low.max) return 'low';
    if (level <= GAS_RANGES.medium.max) return 'medium';
    return 'high';
  };

  // Efecto para manejar las alarmas cuando cambia el nivel de gas
  useEffect(() => {
    const range = getGasRange(gasLevel);
    setCurrentRange(range);

    // Activar alarma si hay cualquier nivel de gas detectable
    if (gasLevel > 0) {
      setAlarmActive(true);
      setModalVisible(true);
      // Vibrar cuando hay alarma
      Vibration.vibrate([500, 500], true);
    } else {
      setAlarmActive(false);
      setModalVisible(false);
      Vibration.cancel();
    }
  }, [gasLevel]);

  // Función para apagar la alarma del celular
  const turnOffPhoneAlarm = () => {
    setAlarmActive(false);
    setModalVisible(false);
    Vibration.cancel();
    Alert.alert('Alarma apagada', 'La alarma del celular ha sido desactivada');
  };

  // Función para apagar el buzzer (solo en nivel bajo)
  const turnOffBuzzer = () => {
    if (currentRange === 'low') {
      Alert.alert('Buzzer apagado', 'El buzzer físico ha sido desactivado');
      // Aquí iría la lógica para comunicarse con el hardware
    } else {
      Alert.alert(
        'No se puede apagar', 
        'Solo puedes apagar el buzzer cuando los niveles de gas sean BAJOS'
      );
    }
  };

  // Botones de prueba para simular niveles
  const testButtons = [
    { level: 0, label: 'SIN GAS', description: 'Nivel: 0 PPM' },
    { level: 50, label: 'NIVEL BAJO', description: 'Nivel: 50 PPM' },
    { level: 300, label: 'NIVEL MEDIO', description: 'Nivel: 300 PPM' },
    { level: 800, label: 'NIVEL ALTO', description: 'Nivel: 800 PPM' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/gas-natural.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Indicador de nivel de gas */}
      <View style={styles.gasIndicator}>
        <Text style={styles.gasLevelText}>{gasLevel} PPM</Text>
        <View style={[styles.rangeIndicator, { backgroundColor: GAS_RANGES[currentRange].color }]}>
          <Text style={styles.rangeText}>
            {GAS_RANGES[currentRange].label}
          </Text>
        </View>
      </View>

      {/* Barra de nivel de gas */}
      <View style={styles.gasBarContainer}>
        <View style={styles.gasBar}>
          <View 
            style={[
              styles.gasLevelFill, 
              { 
                width: `${Math.min((gasLevel / GAS_RANGES.high.max) * 100, 100)}%`,
                backgroundColor: GAS_RANGES[currentRange].color
              }
            ]} 
          />
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>Bajo</Text>
          <Text style={styles.rangeLabel}>Medio</Text>
          <Text style={styles.rangeLabel}>Alto</Text>
        </View>
      </View>

      {/* Botones de control */}
      <View style={styles.controlButtons}>
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { backgroundColor: COLORS.accent }
          ]}
          onPress={turnOffPhoneAlarm}
        >
          <Text style={styles.controlButtonText}>Apagar Alarma Celular</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { 
              backgroundColor: currentRange === 'low' ? COLORS.accent : '#CCCCCC',
              opacity: currentRange === 'low' ? 1 : 0.6
            }
          ]}
          onPress={turnOffBuzzer}
          disabled={currentRange !== 'low'}
        >
          <Text style={styles.controlButtonText}>Apagar Buzzer Físico</Text>
          <Text style={styles.controlSubText}>(Solo en nivel bajo)</Text>
        </TouchableOpacity>
      </View>

      {/* Botones de prueba */}
      <View style={styles.testSection}>
        <Text style={styles.testTitle}>Botones de Prueba</Text>
        <View style={styles.testButtons}>
          {testButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.testButton,
                { backgroundColor: COLORS.accent }
              ]}
              onPress={() => setGasLevel(button.level)}
            >
              <Text style={styles.testButtonText}>{button.label}</Text>
              <Text style={styles.testButtonDescription}>{button.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal de alarma */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡ALERTA DE GAS!</Text>
            <Text style={styles.modalText}>
              Niveles de gas detectados: {gasLevel} PPM
            </Text>
            <Text style={styles.modalSubText}>
              Rango: {GAS_RANGES[currentRange].label}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={turnOffPhoneAlarm}
            >
              <Text style={styles.modalButtonText}>Apagar Alarma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 200,
    height: 80,
  },
  gasIndicator: {
    alignItems: 'center',
    marginVertical: 30,
  },
  gasLevelText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  rangeIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rangeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  gasBarContainer: {
    marginVertical: 20,
  },
  gasBar: {
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gasLevelFill: {
    height: '100%',
    borderRadius: 15,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  controlButtons: {
    marginVertical: 20,
  },
  controlButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  controlSubText: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 5,
  },
  testSection: {
    marginTop: 20,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  testButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  testButtonDescription: {
    fontSize: 10,
    color: COLORS.white,
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.high,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubText: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.high,
  },
});

export default GasSensorApp;