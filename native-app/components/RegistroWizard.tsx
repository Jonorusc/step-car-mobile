import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { useSession } from '@/hooks/useSession';
import { BackendEstablishment } from '@/hooks/useEstablishments';
import { getSafeErrorMessage } from '@/utils/errorMessages';
import { validatePlate } from '@/utils/validation';

interface Service {
  id: number;
  name: string;
  price: number;
  category_id?: number;
}

interface SelectedService extends Service {
  quantity: number;
}

interface Category {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  cnpj: string;
}

interface RegistroWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (createdVehicle: any) => void;
}

export default function RegistroWizard({ visible, onClose, onSuccess }: RegistroWizardProps) {
  const queryClient = useQueryClient();
  const { activeEstablishment } = useSession();
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const colorsList = [
    { value: "Branco", label: "Branco", hex: "#FFFFFF" },
    { value: "Preto", label: "Preto", hex: "#000000" },
    { value: "Prata", label: "Prata", hex: "#C0C0C0" },
    { value: "Cinza", label: "Cinza", hex: "#808080" },
    { value: "Azul", label: "Azul", hex: "#0000FF" },
    { value: "Vermelho", label: "Vermelho", hex: "#FF0000" },
    { value: "Verde", label: "Verde", hex: "#008000" },
    { value: "Amarelo", label: "Amarelo", hex: "#FFFF00" },
    { value: "Laranja", label: "Laranja", hex: "#FFA500" },
    { value: "Roxo", label: "Roxo", hex: "#800080" },
    { value: "Marrom", label: "Marrom", hex: "#8B4513" },
  ];
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [discountStr, setDiscountStr] = useState(''); // Formatted as currency BRL string
  const [discountCents, setDiscountCents] = useState(0);

  // Queries
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', activeEstablishment?.id],
    queryFn: async () => {
      const res = await api.get('/user/category/list', { params: { establishmentId: activeEstablishment?.id } });
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: visible && !!activeEstablishment,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services', activeEstablishment?.id, selectedCategories.map(c => c.id).join(',')],
    queryFn: async () => {
      const categoryIdsParam = selectedCategories.map(c => c.id).join(',');
      const res = await api.get('/user/service/list', { 
        params: { establishmentId: activeEstablishment?.id, categoryIds: categoryIdsParam } 
      });
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: visible && !!activeEstablishment && selectedCategories.length > 0,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/user/company/list');
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: visible,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setPlate('');
      setModel('');
      setColor('');
      setSelectedCategories([]);
      setSelectedServices([]);
      setSelectedCompany(null);
      setDiscountStr('');
      setDiscountCents(0);
      setServiceSearch('');
    }
  }, [visible]);

  // Format Discount Input
  const handleDiscountChange = (text: string) => {
    // Keep only numbers
    const cleanNum = text.replace(/[^0-9]/g, '');
    if (!cleanNum) {
      setDiscountStr('');
      setDiscountCents(0);
      return;
    }

    const cents = parseInt(cleanNum, 10);
    setDiscountCents(cents);

    // Format BRL
    const formatted = `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    setDiscountStr(formatted);
  };

  const getServiceQuantity = (serviceId: number) => {
    const s = selectedServices.find(x => x.id === serviceId);
    return s ? s.quantity : 0;
  };

  const updateServiceQuantity = (service: Service, quantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedServices((prev) => {
      if (quantity <= 0) {
        return prev.filter(s => s.id !== service.id);
      }
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        return prev.map(s => s.id === service.id ? { ...s, quantity } : s);
      }
      return [...prev, { ...service, quantity }];
    });
  };

  const toggleCategory = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) => {
      const exists = prev.find(c => c.id === cat.id);
      if (exists) return prev.filter(c => c.id !== cat.id);
      return [...prev, cat];
    });
  };

  const getSubtotal = () => {
    return selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  const getNetPrice = () => {
    const sub = getSubtotal();
    return Math.max(0, sub - discountCents);
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 1) {
      if (!plate || !model || !color) {
        Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os dados básicos do veículo.');
        return;
      }
      if (!validatePlate(plate)) {
        Alert.alert('Placa Inválida', 'Insira uma placa válida (formato ABC1D23 ou ABC1234).');
        return;
      }
    } else if (currentStep === 2 && selectedCategories.length === 0) {
      Alert.alert('Categorias Obrigatórias', 'Por favor, selecione pelo menos uma categoria.');
      return;
    } else if (currentStep === 3 && selectedServices.length === 0) {
      Alert.alert('Serviço Obrigatório', 'Por favor, selecione pelo menos um serviço.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        establishmentId: activeEstablishment?.id,
        services: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          quantity: s.quantity,
          category_id: s.category_id
        })),
        companyId: selectedCompany?.id || null,
        plate: plate.toUpperCase(),
        model: model,
        color: color,
        discount: discountCents,
      };
      const res = await api.post('/user/vehicle/create', payload);
      return res.data;
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vehicles', activeEstablishment?.id] });
      onSuccess(data.data);
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = getSafeErrorMessage(err, 'Não foi possível cadastrar o veículo.');
      Alert.alert('Erro no Cadastro', message);
    },
  });

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createMutation.mutate();
  };

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
              <Text style={styles.sheetTitle}>Novo Registro</Text>
              <Text style={styles.sheetSub}>Passo {currentStep} de 5</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Progress Timeline */}
          <View style={styles.timeline}>
            {[1, 2, 3, 4, 5].map((step) => {
              const isActive = step === currentStep;
              const isPast = step < currentStep;
              return (
                <React.Fragment key={step}>
                  <View
                    style={[
                      styles.timelineDot,
                      isActive ? styles.timelineDotActive : null,
                      isPast ? styles.timelineDotPast : null,
                    ]}
                  >
                    {isPast ? (
                      <MaterialIcons name="check" size={12} color="#ffffff" />
                    ) : (
                      <Text style={[styles.timelineDotText, isActive ? styles.timelineDotTextActive : null]}>
                        {step}
                      </Text>
                    )}
                  </View>
                  {step < 5 && (
                    <View style={[styles.timelineLine, isPast ? styles.timelineLinePast : null]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Steps Viewport */}
          <ScrollView style={styles.viewport} contentContainerStyle={styles.viewportContent}>
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Dados Básicos do Veículo</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Placa</Text>
                  <TextInput
                    style={[styles.input, styles.plateInput]}
                    placeholder="ABC1D23"
                    value={plate}
                    onChangeText={(val) => setPlate(val.toUpperCase().slice(0, 7))}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Honda Civic"
                    value={model}
                    onChangeText={setModel}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cor</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {colorsList.map((c) => {
                      const isSelected = color === c.value;
                      return (
                        <TouchableOpacity
                          key={c.value}
                          onPress={() => setColor(c.value)}
                          style={[
                            styles.colorOption,
                            isSelected && styles.colorOptionSelected,
                          ]}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.colorCircle, { backgroundColor: c.hex }, c.value === 'Branco' && { borderWidth: 1, borderColor: '#e2e8f0' }]} />
                          <Text style={[styles.colorText, isSelected && styles.colorTextSelected]}>{c.label}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Categorias</Text>
                
                {loadingCategories ? (
                  <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
                ) : (
                  <View style={styles.categoryGrid}>
                    {categories.map((cat: Category) => {
                      const isSelected = !!selectedCategories.find(c => c.id === cat.id);
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.categoryCard, isSelected ? styles.categoryCardSelected : null]}
                          onPress={() => toggleCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons
                            name="directions-car"
                            size={28}
                            color={isSelected ? '#ffffff' : '#64748b'}
                          />
                          <Text style={[styles.categoryCardText, isSelected ? styles.categoryCardTextSelected : null]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Selecione os Serviços</Text>
                <Text style={styles.stepDesc}>Serviços das categorias: {selectedCategories.map(c => c.name).join(', ')}</Text>
                
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar serviço..."
                    placeholderTextColor="#94a3b8"
                    value={serviceSearch}
                    onChangeText={setServiceSearch}
                  />
                </View>

                {loadingServices ? (
                  <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
                ) : (
                  <View style={styles.servicesList}>
                    {(() => {
                      const grouped: Record<number, Service[]> = {};
                      services.forEach((svc: Service) => {
                        if (serviceSearch && !svc.name.toLowerCase().includes(serviceSearch.toLowerCase())) {
                          return;
                        }
                        const catId = svc.category_id || 0;
                        if (!grouped[catId]) grouped[catId] = [];
                        grouped[catId].push(svc);
                      });

                      const renderedGroups = Object.keys(grouped).map(catIdStr => {
                        const catId = parseInt(catIdStr, 10);
                        const cat = selectedCategories.find(c => c.id === catId);
                        const catName = cat ? cat.name : 'Outros';
                        const groupServices = grouped[catId];
                        
                        if (groupServices.length === 0) return null;

                        return (
                          <View key={catId} style={styles.categorySection}>
                            <Text style={styles.categorySectionTitle}>{catName}</Text>
                            {groupServices.map((svc: Service) => {
                              const qty = getServiceQuantity(svc.id);
                              const isSelected = qty > 0;
                              return (
                                <View key={svc.id} style={[styles.serviceRow, isSelected ? styles.serviceRowSelected : null]}>
                                  <View style={styles.serviceRowLeft}>
                                    <Text style={[styles.serviceRowText, isSelected ? styles.serviceRowTextSelected : null]}>
                                      {svc.name}
                                    </Text>
                                    <Text style={[styles.serviceRowPrice, isSelected ? styles.serviceRowPriceSelected : null]}>
                                      R$ {(svc.price / 100).toFixed(2).replace('.', ',')}
                                    </Text>
                                  </View>
                                  
                                  <View style={styles.qtyControls}>
                                    <TouchableOpacity onPress={() => updateServiceQuantity(svc, qty - 1)} style={styles.qtyBtn} activeOpacity={0.7} disabled={qty === 0}>
                                      <MaterialIcons name="remove" size={16} color={qty > 0 ? "#0f172a" : "#cbd5e1"} />
                                    </TouchableOpacity>
                                    <Text style={[styles.qtyText, qty === 0 && { color: '#cbd5e1' }]}>{qty}</Text>
                                    <TouchableOpacity onPress={() => updateServiceQuantity(svc, qty + 1)} style={styles.qtyBtn} activeOpacity={0.7}>
                                      <MaterialIcons name="add" size={16} color="#0f172a" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        );
                      });
                      
                      if (renderedGroups.every(g => g === null)) {
                        return (
                          <Text style={{textAlign: 'center', color: '#64748b', marginTop: 20}}>
                            Nenhum serviço encontrado para "{serviceSearch}"
                          </Text>
                        );
                      }
                      return renderedGroups;
                    })()}
                  </View>
                )}

                <View style={styles.accumulatedBox}>
                  <Text style={styles.accumulatedLabel}>Subtotal Acumulado:</Text>
                  <Text style={styles.accumulatedVal}>
                    R$ {(getSubtotal() / 100).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}

            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Empresa Parceira & Desconto</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Empresa Conveniada (Opcional)</Text>
                  <View style={styles.companySelectGrid}>
                    <TouchableOpacity
                      style={[styles.companyCard, selectedCompany === null ? styles.companyCardSelected : null]}
                      onPress={() => setSelectedCompany(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.companyCardText, selectedCompany === null ? styles.companyCardTextSelected : null]}>
                        Nenhuma
                      </Text>
                    </TouchableOpacity>
                    {companies.map((comp: Company) => {
                      const isSelected = selectedCompany?.id === comp.id;
                      return (
                        <TouchableOpacity
                          key={comp.id}
                          style={[styles.companyCard, isSelected ? styles.companyCardSelected : null]}
                          onPress={() => setSelectedCompany(comp)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.companyCardText, isSelected ? styles.companyCardTextSelected : null]} numberOfLines={1}>
                            {comp.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Desconto Especial (Opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="R$ 0,00"
                    keyboardType="numeric"
                    value={discountStr}
                    onChangeText={handleDiscountChange}
                  />
                </View>
              </View>
            )}

            {currentStep === 5 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Resumo do Registro</Text>
                
                <View style={styles.invoiceCard}>
                  {/* License Plate Banner */}
                  <View style={styles.invoicePlate}>
                    <View style={styles.invoicePlateHeader}>
                      <Text style={styles.invoicePlateHeaderText}>BRASIL</Text>
                    </View>
                    <Text style={styles.invoicePlateVal}>{plate.toUpperCase()}</Text>
                  </View>

                  <View style={styles.invoiceMeta}>
                    <View style={styles.invoiceMetaRow}>
                      <Text style={styles.invoiceMetaLabel}>Modelo:</Text>
                      <Text style={styles.invoiceMetaVal}>{model}</Text>
                    </View>
                    <View style={styles.invoiceMetaRow}>
                      <Text style={styles.invoiceMetaLabel}>Cor:</Text>
                      <Text style={styles.invoiceMetaVal}>{color}</Text>
                    </View>
                    <View style={styles.invoiceMetaRow}>
                      <Text style={styles.invoiceMetaLabel}>Categorias:</Text>
                      <Text style={styles.invoiceMetaVal} numberOfLines={1}>
                        {selectedCategories.map(c => c.name).join(', ')}
                      </Text>
                    </View>
                    {selectedCompany && (
                      <View style={styles.invoiceMetaRow}>
                        <Text style={styles.invoiceMetaLabel}>Convênio:</Text>
                        <Text style={styles.invoiceMetaVal}>{selectedCompany.name}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.invoiceServices}>
                    <Text style={styles.invoiceSectionTitle}>Serviços Contratados</Text>
                    {selectedServices.map((svc) => (
                      <View key={svc.id} style={styles.invoiceSvcRow}>
                        <Text style={styles.invoiceSvcName}>• {svc.name} {svc.quantity > 1 ? `(x${svc.quantity})` : ''}</Text>
                        <Text style={styles.invoiceSvcPrice}>
                          R$ {((svc.price * svc.quantity) / 100).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.invoicePricing}>
                    <View style={styles.invoicePricingRow}>
                      <Text style={styles.invoicePriceLabel}>Subtotal:</Text>
                      <Text style={styles.invoicePriceValue}>
                        R$ {(getSubtotal() / 100).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    
                    {discountCents > 0 && (
                      <View style={styles.invoicePricingRow}>
                        <Text style={styles.invoicePriceLabel}>Desconto:</Text>
                        <Text style={[styles.invoicePriceValue, { color: '#ef4444' }]}>
                          -R$ {(discountCents / 100).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.invoicePricingRow, styles.invoiceGrandTotalRow]}>
                      <Text style={styles.invoiceTotalLabel}>Valor Final:</Text>
                      <Text style={styles.invoiceTotalValue}>
                        R$ {(getNetPrice() / 100).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Nav Controls */}
          <View style={styles.footerControls}>
            {currentStep > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handlePrevStep} activeOpacity={0.7}>
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {currentStep < 5 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>Avançar</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.saveBtn, createMutation.isPending ? styles.saveBtnDisabled : null]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="print" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Salvar e Imprimir</Text>
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
    height: '90%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#0f172a',
  },
  timelineDotPast: {
    backgroundColor: '#10b981',
  },
  timelineDotText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  timelineDotTextActive: {
    color: '#ffffff',
  },
  timelineLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  timelineLinePast: {
    backgroundColor: '#10b981',
  },
  viewport: {
    flex: 1,
  },
  viewportContent: {
    padding: 24,
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  plateInput: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  colorOption: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  colorOptionSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  colorTextSelected: {
    color: '#0f172a',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1.1,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  categoryCardSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCardTextSelected: {
    color: '#ffffff',
  },
  servicesList: {
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  serviceRowSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  serviceRowLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#0d9488',
  },
  serviceRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  serviceRowTextSelected: {
    color: '#0f172a',
  },
  serviceRowPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  serviceRowPriceSelected: {
    color: '#0f172a',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 20,
    textAlign: 'center',
  },
  accumulatedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accumulatedLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  accumulatedVal: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
  },
  companySelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  companyCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  companyCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  companyCardText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  companyCardTextSelected: {
    color: '#ffffff',
  },
  invoiceCard: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  invoicePlate: {
    width: 120,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#002060',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  invoicePlateHeader: {
    height: 12,
    backgroundColor: '#002060',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoicePlateHeaderText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#ffffff',
  },
  invoicePlateVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 1,
  },
  invoiceMeta: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
    gap: 6,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceMetaLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  invoiceMetaVal: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  invoiceServices: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  invoiceSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  invoiceSvcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  invoiceSvcName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  invoiceSvcPrice: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  invoicePricing: {
    gap: 6,
  },
  invoicePricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoicePriceLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  invoicePriceValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  invoiceGrandTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    marginTop: 4,
  },
  invoiceTotalLabel: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
  },
  invoiceTotalValue: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '900',
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0d9488',
    flex: 1,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
