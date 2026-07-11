import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useEstablishments, BackendEstablishment } from '@/hooks/useEstablishments';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/hooks/useAuth';

export default function EstablishmentsScreen() {
    const router = useRouter();
    const { data: establishments, isLoading: isLoadingEstb } = useEstablishments();
    const { activeEstablishment, setActiveEstablishment, isLoadingSession } = useSession();
    const { user, logout, isLoading: isLoggingOut } = useAuthStore();

    // If already selected, redirect to dashboard automatically
    useEffect(() => {
        if (activeEstablishment) {
            router.replace('/(private)/dashboard');
        }
    }, [activeEstablishment]);

    const handleSelect = async (est: BackendEstablishment) => {
        await setActiveEstablishment(est);
        router.replace('/(private)/dashboard');
    };

    const handleLogout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await logout();
        router.replace('/login');
    };

    if (isLoadingEstb || isLoadingSession) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Carregando estabelecimentos...</Text>
            </View>
        );
    }

    const renderEstablishmentCard = ({ item }: { item: BackendEstablishment }) => {
        const dotColor = item.cor_system || '#0284c7';

        return (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)} activeOpacity={0.8}>
                <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: `${dotColor}10` }]}>
                        <MaterialIcons name="storefront" size={24} color={dotColor} />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.estName}>{item.name_by_company}</Text>
                        <Text style={styles.estDoc}>{item.document || 'CNPJ não informado'}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {item.type === 'CAR_WASH_AND_PARKING' ? 'Lavagem & Estacionamento' : item.type}
                            </Text>
                        </View>
                    </View>

                    <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
                <MaterialIcons name="store-mall-directory" size={40} color="#94a3b8" />
                <View style={styles.emptyAlertBadge}>
                    <MaterialIcons name="warning" size={14} color="#f59e0b" />
                </View>
            </View>
            <Text style={styles.emptyTitle}>Nenhum Estabelecimento</Text>
            <Text style={styles.emptyDesc}>
                Sua conta operacional está cadastrada, mas você não possui nenhum estabelecimento associado. Entre em
                contato com seu administrador.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../../assets/images/splash-icon.png')} style={styles.logo} />
                <Text style={styles.title}>Selecionar Estabelecimento</Text>
                <Text style={styles.subtitle}>
                    Olá, {user?.name || 'Operador'}. Escolha abaixo para iniciar seu trabalho.
                </Text>
            </View>

            {establishments && establishments.length > 0 ? (
                <FlatList
                    data={establishments}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderEstablishmentCard}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerWrapper}>{renderEmptyState()}</View>
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                    activeOpacity={0.8}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator color="#475569" />
                    ) : (
                        <>
                            <MaterialIcons name="logout" size={18} color="#475569" style={{ marginRight: 8 }} />
                            <Text style={styles.logoutText}>Entrar com outra conta</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 12,
        fontWeight: '500',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 32,
        marginBottom: 24,
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    estName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    estDoc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    badge: {
        marginTop: 6,
        backgroundColor: '#f1f5f9',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '600',
    },
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 24,
        alignItems: 'center',
    },
    emptyIconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 16,
    },
    emptyAlertBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ffffff',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
        textAlign: 'center',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    logoutBtn: {
        flexDirection: 'row',
        height: 48,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    logoutText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
});
