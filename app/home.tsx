import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ThemedText } from '@/components/ThemedText';
import { WorshipCard } from '@/components/WorshipCard';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';
import { useCommunications, useSongs, useWorships } from '@/hooks/useSimpleDatabase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const t = useT();
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const cardColor = useThemeColor({}, 'cardBackground');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const accentColor = useThemeColor({}, 'accent');

  const { user } = useAuth();
  const { songs, isLoading: songsLoading, loadSongs } = useSongs();
  const { worships, isLoading: worshipsLoading, loadWorships } = useWorships();
  const { communications, isLoading: communicationsLoading, loadCommunications } = useCommunications();

  const redirectToLoginIfNeeded = useCallback(() => {
    if (!user) router.replace('/login');
  }, [user]);

  useEffect(() => {
    redirectToLoginIfNeeded();
  }, [redirectToLoginIfNeeded]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadSongs(), loadWorships(), loadCommunications()]);
    } catch (error) {
      console.error(t('home.refreshError'), error);
    } finally {
      setRefreshing(false);
    }
  }, [loadSongs, loadWorships, loadCommunications]);

  const now = useMemo(() => new Date(), []);
  const upcomingWorships = useMemo(() =>
    worships.filter(w => new Date(`${w.date}T${w.time}`) >= now).slice(0, 3),
    [worships, now]
  );

  const recentSongs = useMemo(() => songs.slice(0, 4), [songs]);
  const recentCommunications = useMemo(() => communications.slice(0, 5), [communications]);

  const isLoading = useMemo(() =>
    songsLoading || worshipsLoading || communicationsLoading,
    [songsLoading, worshipsLoading, communicationsLoading]
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText style={[styles.greeting, { color: secondaryColor }]}>
                {t('home.greeting')}
              </ThemedText>
              <ThemedText style={[styles.name, { color: textColor }]}>
                {user?.name}
              </ThemedText>
            </View>
            <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
              <Ionicons name="person" size={24} color={primaryColor} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}>
              <View style={[styles.statIcon, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name="calendar" size={20} color={primaryColor} />
              </View>
              <ThemedText style={[styles.statNumber, { color: textColor }]}>
                {worships.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
                {t('home.stats.worships')}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}>
              <View style={[styles.statIcon, { backgroundColor: successColor + '15' }]}>
                <Ionicons name="musical-notes" size={20} color={successColor} />
              </View>
              <ThemedText style={[styles.statNumber, { color: textColor }]}>
                {songs.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
                {t('home.stats.songs')}
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: cardColor }]}>
              <View style={[styles.statIcon, { backgroundColor: warningColor + '15' }]}>
                <Ionicons name="chatbubbles" size={20} color={warningColor} />
              </View>
              <ThemedText style={[styles.statNumber, { color: textColor }]}>
                {communications.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
                {t('home.stats.communications')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('home.upcomingWorships')}
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={[styles.seeAll, { color: primaryColor }]}>
                  {t('home.seeAll')}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {upcomingWorships.length > 0 ? (
              <View style={styles.cardList}>
                {upcomingWorships.map((worship) => (
                  <WorshipCard
                    key={worship.id}
                    id={worship.id!}
                    title={worship.title}
                    date={worship.date}
                    time={worship.time}
                    location={worship.location}
                    theme={worship.theme}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
                <Ionicons name="calendar-outline" size={32} color={secondaryColor} />
                <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                  {t('home.noUpcoming')}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {t('home.recentCommunications')}
              </ThemedText>
            </View>
            {recentCommunications.length > 0 ? (
              <View style={styles.cardList}>
                {recentCommunications.map((comm) => (
                  <View key={comm.id} style={[styles.commCard, { backgroundColor: cardColor }]}>
                    <View style={styles.commHeader}>
                      <View style={[styles.commTypeBadge, {
                        backgroundColor: comm.type === 'urgent' ? accentColor + '15' :
                          comm.type === 'reminder' ? warningColor + '15' : primaryColor + '15'
                      }]}>
                        <Ionicons
                          name={comm.type === 'urgent' ? 'warning' :
                            comm.type === 'reminder' ? 'time' : 'information'}
                          size={14}
                          color={comm.type === 'urgent' ? accentColor :
                            comm.type === 'reminder' ? warningColor : primaryColor}
                        />
                      </View>
                      <View style={styles.commContent}>
                        <ThemedText style={[styles.commType, { color: textColor }]} numberOfLines={1}>
                          {comm.type === 'urgent' ? t('home.urgent') :
                            comm.type === 'reminder' ? t('home.reminder') : t('home.info')}
                        </ThemedText>
                        <ThemedText style={[styles.commMessage, { color: secondaryColor }]} numberOfLines={2}>
                          {comm.message || t('home.emptyMessage')}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.commTime, { color: secondaryColor }]}>
                        {new Date(comm.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
                <Ionicons name="chatbubble-outline" size={32} color={secondaryColor} />
                <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                  {t('home.noCommunications')}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { gap: 4 },
  greeting: { fontSize: 15, fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '700' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  section: { gap: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  cardList: { gap: 10 },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  commCard: {
    padding: 14,
    borderRadius: 14,
  },
  commHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commContent: { flex: 1, gap: 2 },
  commType: { fontSize: 14, fontWeight: '600' },
  commMessage: { fontSize: 13, lineHeight: 18 },
  commTime: { fontSize: 12 },
});
