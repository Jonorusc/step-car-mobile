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
import { formatCurrencyBRL, formatPlateInput, formatPlateDisplay, unformatPlate } from '@/utils/formatters';

interface Service {
  id: number;
  name: string;
  price: number;
  category_id?: number;
  description: string;
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
  company_name: string;
  fantasy_name: string;
  cnpj?: string;
}

interface RegistroWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (createdVehicle: any, shouldPrint: boolean) => void;
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
  const [categorySearch, setCategorySearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [successVehicle, setSuccessVehicle] = useState<any>(null);
  const [successVisible, setSuccessVisible] = useState(false);

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
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
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
    queryKey: ['wizard_companies_list', activeEstablishment?.id],
    queryFn: async () => {
      const res = await api.get('/user/company/list', {
        params: { establishmentId: activeEstablishment?.id, limitPerPage: 100, page: 1 }
      });
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: !!activeEstablishment,
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
      setCategorySearch('');
      setCompanySearch('');
      setSuccessVehicle(null);
      setSuccessVisible(false);
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

    let cents = parseInt(cleanNum, 10);
    const subtotal = getSubtotal();
    if (cents > subtotal) {
      cents = subtotal;
      Alert.alert('Desconto Inválido', 'O desconto não pode ser maior que o subtotal.');
    }
    setDiscountCents(cents);

    // Format BRL
    const formatted = formatCurrencyBRL(cents);
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
      if (exists) {
        setSelectedServices(prevSvc => prevSvc.filter(s => s.category_id !== cat.id));
        return prev.filter(c => c.id !== cat.id);
      }
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
        plate: unformatPlate(plate),
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
      setSuccessVehicle(data.data);
      setSuccessVisible(true);
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = getSafeErrorMessage(err, 'Não foi possível cadastrar o veículo.');
      Alert.alert('Erro no Cadastro', message);
    },
  });

  const [shouldPrintOnSave, setShouldPrintOnSave] = useState(false);

  const handleSave = (print: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (discountCents > getSubtotal()) {
      Alert.alert('Valor do Desconto', 'O desconto não pode ser maior que o subtotal.');
      return;
    }
    setShouldPrintOnSave(print);
    createMutation.mutate();
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    onClose();
    onSuccess(successVehicle, false);
  };

  const handleSuccessPrint = () => {
    setSuccessVisible(false);
    onClose();
    onSuccess(successVehicle, true);
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
              <KeyboardAvoidingView style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Dados Básicos do Veículo</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Placa</Text>
                  <TextInput
                    style={[styles.input, styles.plateInput]}
                    placeholder="ABC1D23"
                    value={plate}
                    onChangeText={(val) => setPlate(formatPlateInput(val))}
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
              </KeyboardAvoidingView>
            )}

            {currentStep === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Categorias</Text>

                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar categoria..."
                    placeholderTextColor="#94a3b8"
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                  />
                </View>

                {loadingCategories ? (
                  <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
                ) : (
                  <View style={styles.categoryGrid}>
                    {(() => {
                      const filteredCategories = categories.filter((cat: Category) =>
                        !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                      );

                      if (filteredCategories.length === 0) {
                        return (
                          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20, width: '100%' }}>
                            Nenhuma categoria encontrada para "{categorySearch}"
                          </Text>
                        );
                      }

                      return filteredCategories.map((cat: Category) => {
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
                      });
                    })()}
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
                                    <Text style={[styles.serviceRowDescription, isSelected ? styles.serviceRowTextSelected : null]}>
                                      {svc.description}
                                    </Text>
                                    <Text style={[styles.serviceRowPrice, isSelected ? styles.serviceRowPriceSelected : null]}>
                                      {formatCurrencyBRL(svc.price)}
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
                          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>
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
                    {formatCurrencyBRL(getSubtotal())}
                  </Text>
                </View>
              </View>
            )}

            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Empresa Parceira</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Empresa Conveniada (Opcional)</Text>
                  <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownToggleText, !selectedCompany && { color: '#94a3b8' }]}>
                      {selectedCompany ? (selectedCompany.fantasy_name || selectedCompany.company_name) : 'Selecione uma empresa'}
                    </Text>
                    <MaterialIcons name={showCompanyDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#64748b" />
                  </TouchableOpacity>

                  {showCompanyDropdown && (
                    <View style={styles.dropdownList}>
                      <View style={[styles.searchContainer, { marginHorizontal: 8, marginTop: 8, marginBottom: 8, height: 38 }]}>
                        <MaterialIcons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                          style={[styles.searchInput, { fontSize: 13, height: 36 }]}
                          placeholder="Buscar empresa..."
                          placeholderTextColor="#94a3b8"
                          value={companySearch}
                          onChangeText={setCompanySearch}
                        />
                      </View>
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                        <TouchableOpacity
                          style={[styles.dropdownItem, selectedCompany === null && styles.dropdownItemSelected]}
                          onPress={() => { setSelectedCompany(null); setShowCompanyDropdown(false); setCompanySearch(''); }}
                        >
                          <Text style={[styles.dropdownItemText, selectedCompany === null && styles.dropdownItemTextSelected]}>
                            Nenhuma
                          </Text>
                          {selectedCompany === null && <MaterialIcons name="check" size={20} color="#0f172a" />}
                        </TouchableOpacity>

                        {(() => {
                          const filtered = companies.filter((comp: Company) => {
                            const name = (comp.fantasy_name || comp.company_name || '').toLowerCase();
                            return name.includes(companySearch.toLowerCase());
                          });

                          if (filtered.length === 0) {
                            return (
                              <Text style={{ textAlign: 'center', color: '#64748b', marginVertical: 12, fontSize: 13 }}>
                                Nenhuma empresa encontrada
                              </Text>
                            );
                          }

                          return filtered.map((comp: Company) => {
                            const isSelected = selectedCompany?.id === comp.id;
                            return (
                              <TouchableOpacity
                                key={comp.id}
                                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                onPress={() => { setSelectedCompany(comp); setShowCompanyDropdown(false); setCompanySearch(''); }}
                              >
                                <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={1}>
                                  {comp.fantasy_name || comp.company_name}
                                </Text>
                                {isSelected && <MaterialIcons name="check" size={20} color="#0f172a" />}
                              </TouchableOpacity>
                            );
                          });
                        })()}
                      </ScrollView>
                    </View>
                  )}
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
                    <Text style={styles.invoicePlateVal}>{formatPlateDisplay(plate)}</Text>
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
                        <Text style={styles.invoiceMetaVal}>{selectedCompany.fantasy_name || selectedCompany.company_name}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.invoiceServices}>
                    <Text style={styles.invoiceSectionTitle}>Serviços Contratados</Text>
                    {selectedServices.map((svc) => (
                      <View key={svc.id} style={styles.invoiceSvcRow}>
                        <Text style={styles.invoiceSvcName}>• {svc.name} (x{svc.quantity})</Text>
                        <Text style={styles.invoiceSvcPrice}>
                          {formatCurrencyBRL(svc.price * svc.quantity)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.invoicePricing}>
                    <View style={styles.invoicePricingRow}>
                      <Text style={styles.invoicePriceLabel}>Subtotal:</Text>
                      <Text style={styles.invoicePriceValue}>
                        {formatCurrencyBRL(getSubtotal())}
                      </Text>
                    </View>

                    {discountCents > 0 && (
                      <View style={styles.invoicePricingRow}>
                        <Text style={styles.invoicePriceLabel}>Desconto:</Text>
                        <Text style={[styles.invoicePriceValue, { color: '#ef4444' }]}>
                          - {formatCurrencyBRL(discountCents)}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.invoicePricingRow, styles.invoiceGrandTotalRow]}>
                      <Text style={styles.invoiceTotalLabel}>Valor Final:</Text>
                      <Text style={styles.invoiceTotalValue}>
                        {formatCurrencyBRL(getNetPrice())}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginTop: 20 }]}>
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
              <View style={{ flexDirection: 'row', gap: 12, flex: 1, marginLeft: 12 }}>
                {/* <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: '#e2e8f0', flex: 1 }, createMutation.isPending ? styles.saveBtnDisabled : null]}
                  onPress={() => handleSave(false)}
                  activeOpacity={0.8}
                  disabled={createMutation.isPending}
                >
                  <Text style={[styles.saveBtnText, { color: '#0f172a' }]}>Salvar</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 2 }, createMutation.isPending ? styles.saveBtnDisabled : null]}
                  onPress={() => handleSave(true)}
                  activeOpacity={0.8}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="print" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.saveBtnText}>Finalizar Registro</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {successVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
          <View style={styles.successOverlay}>
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={36} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Registro Concluído!</Text>
              <Text style={styles.successSubtitle}>
                Veículo <Text style={styles.successPlateBold}>{formatPlateDisplay(plate)}</Text> registrado com sucesso.
              </Text>

              <View style={styles.successCard}>
                <View style={styles.successCardRow}>
                  <Text style={styles.successLabel}>Modelo:</Text>
                  <Text style={styles.successValue}>{model}</Text>
                </View>
                <View style={styles.successCardRow}>
                  <Text style={styles.successLabel}>Total de Serviços:</Text>
                  <Text style={styles.successValue}>{selectedServices.length}</Text>
                </View>
                <View style={[styles.successCardRow, styles.successCardRowDivider]}>
                  <Text style={styles.successFinalLabel}>Valor Final:</Text>
                  <Text style={styles.successFinalValue}>{formatCurrencyBRL(getNetPrice())}</Text>
                </View>
              </View>

              <Text style={styles.successQuestion}>Deseja imprimir o cupom?</Text>

              <View style={styles.successButtonRow}>
                <TouchableOpacity
                  style={styles.successBtnCancel}
                  onPress={handleSuccessClose}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={18} color="#475569" />
                  <Text style={styles.successBtnCancelText}>Não Imprimir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.successBtnPrint}
                  onPress={handleSuccessPrint}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="print" size={18} color="#ffffff" />
                  <Text style={styles.successBtnPrintText}>Imprimir Cupom</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
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
    paddingBottom: 150,
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
    width: '46%',
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
  serviceRowDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748b',
    marginBottom: 4,
    // truncate
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
    position: "sticky",
    top: 0,
    zIndex: 10,
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
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  dropdownToggleText: {
    fontSize: 14,
    color: '#0f172a',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8fafc',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: '#0f172a',
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
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
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
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0d9488',
    flex: 1,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  successPlateBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  successCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  successCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successCardRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 4,
  },
  successLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  successValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  successFinalLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  successFinalValue: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '800',
  },
  successQuestion: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  successButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  successBtnCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  successBtnCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  successBtnPrint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  successBtnPrintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
  },
});
