import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useCreateCompany, useUpdateCompany, Company } from '@/hooks/useCompany';
import { useSession } from '@/hooks/useSession';
import { Theme } from '@/constants/theme';

const maskPhone = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  if (v.length > 5) return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  return v;
};

const maskCpfCnpj = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 14);
  if (v.length > 11) {
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  }
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
};

const maskCep = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) return v.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
  return v;
};

export default function EditCompanyModal({ visible, onClose, onSuccess, company }: any) {
  const { activeEstablishment } = useSession();
  const isEdit = !!company;

  const [currentStep, setCurrentStep] = useState(1);

  // Data Company
  const [companyName, setCompanyName] = useState('');
  const [fantasyName, setFantasyName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address Company
  const [postalcode, setPostalcode] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  useEffect(() => {
    if (visible && company) {
      setCompanyName(company.company_name || '');
      setFantasyName(company.fantasy_name || '');
      setDocument(maskCpfCnpj(company.document || ''));
      setPhone(maskPhone(company.phone || ''));
      setEmail(company.email || '');
      
      const addr = company.address || {};
      setPostalcode(maskCep(addr.postal_code || addr.postalcode || ''));
      setStreet(addr.street || '');
      setNeighborhood(addr.neighborhood || '');
      setState(addr.state || '');
      setCity(addr.city || '');
      setNumber(addr.number || '');
      setComplement(addr.complement || '');
      setCurrentStep(1);
    } else if (visible && !company) {
      setCompanyName('');
      setFantasyName('');
      setDocument('');
      setPhone('');
      setEmail('');
      
      setPostalcode('');
      setStreet('');
      setNeighborhood('');
      setState('');
      setCity('');
      setNumber('');
      setComplement('');
      setCurrentStep(1);
    }
  }, [visible, company]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 1) {
      if (!companyName.trim() || !fantasyName.trim() || !document.trim() || !phone.trim() || !email.trim()) {
        Alert.alert('Dados Incompletos', 'Preencha todos os campos obrigatórios da empresa.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!postalcode.trim() || !street.trim() || !neighborhood.trim() || !state.trim() || !city.trim() || !number.trim()) {
        Alert.alert('Endereço Incompleto', 'Preencha todos os campos obrigatórios do endereço.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const payload = {
      establishmentId: activeEstablishment?.id,
      companyName,
      fantasyName,
      document: document.replace(/[-./]/g, ''),
      phone: phone.replace(/[-./() ]/g, ''),
      email,
      closingDate: 1,
      address: {
        postalcode: postalcode.replace(/[-./]/g, ''),
        street,
        neighborhood,
        state,
        city,
        number,
        complement
      }
    };

    if (isEdit) {
      (payload as any).id = company.id;
    }
    
    const mutation = isEdit ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao salvar empresa.');
      }
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
      <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
      <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
      <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]} />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</Text>
              <Text style={styles.sheetSub}>
                {currentStep === 1 && 'Etapa 1 de 3: Dados da Empresa'}
                {currentStep === 2 && 'Etapa 2 de 3: Endereço'}
                {currentStep === 3 && 'Etapa 3 de 3: Resumo'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>
          
          {renderStepIndicator()}

          {/* Form Content */}
          <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
            
            {currentStep === 1 && (
              <View>
                <Text style={styles.sectionTitle}>Dados Básicos</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Razão Social *</Text>
                  <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome Fantasia *</Text>
                  <TextInput style={styles.input} value={fantasyName} onChangeText={setFantasyName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CPF/CNPJ *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={document} 
                    onChangeText={(t) => setDocument(maskCpfCnpj(t))} 
                    keyboardType="number-pad" 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefone *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={phone} 
                    onChangeText={(t) => setPhone(maskPhone(t))} 
                    keyboardType="phone-pad" 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>E-mail *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                  />
                </View>
              </View>
            )}

            {currentStep === 2 && (
              <View>
                <Text style={styles.sectionTitle}>Endereço da Sede</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CEP *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={postalcode} 
                    onChangeText={(t) => setPostalcode(maskCep(t))} 
                    keyboardType="number-pad" 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rua *</Text>
                  <TextInput style={styles.input} value={street} onChangeText={setStreet} />
                </View>
                
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Número *</Text>
                    <TextInput style={styles.input} value={number} onChangeText={setNumber} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Complemento</Text>
                    <TextInput style={styles.input} value={complement} onChangeText={setComplement} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bairro *</Text>
                  <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Cidade *</Text>
                    <TextInput style={styles.input} value={city} onChangeText={setCity} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>UF *</Text>
                    <TextInput style={styles.input} value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" />
                  </View>
                </View>
              </View>
            )}

            {currentStep === 3 && (
              <View>
                <Text style={styles.sectionTitle}>Resumo dos Dados</Text>
                
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeader}>Empresa</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Razão Social:</Text>
                    <Text style={styles.summaryValue}>{companyName}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Nome Fantasia:</Text>
                    <Text style={styles.summaryValue}>{fantasyName}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>CNPJ/CPF:</Text>
                    <Text style={styles.summaryValue}>{document}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Contato:</Text>
                    <Text style={styles.summaryValue}>{phone} - {email}</Text>
                  </View>
                </View>

                <View style={[styles.summaryCard, { marginTop: 12 }]}>
                  <Text style={styles.summaryHeader}>Endereço</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Rua:</Text>
                    <Text style={styles.summaryValue}>{street}, {number} {complement ? `(${complement})` : ''}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bairro:</Text>
                    <Text style={styles.summaryValue}>{neighborhood}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cidade:</Text>
                    <Text style={styles.summaryValue}>{city} - {state}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>CEP:</Text>
                    <Text style={styles.summaryValue}>{postalcode}</Text>
                  </View>
                </View>
              </View>
            )}

          </ScrollView>

          {/* Footer Controls */}
          <View style={styles.footerControls}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={currentStep === 1 ? onClose : handlePrev} 
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </Text>
            </TouchableOpacity>

            {currentStep < 3 ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Próximo</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveBtn, 
                  (createMutation.isPending || updateMutation.isPending) ? styles.saveBtnDisabled : null
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '90%',
    height: '90%', // Using full allowed height for wizard
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Theme.colors.primary,
  },
  formContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    width: 100,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryValue: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  footerControls: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  backBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0f172a', // Darker for intermediate steps
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
