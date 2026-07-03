import { Text, TouchableOpacity } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Song {
  id: string;
  title: string;
  lyrics: string;
  author: string;
}

interface SongItemProps {
  song: Song;
  onPress: () => void;
}

export const SongItem = ({ song, onPress }: SongItemProps) => {
  const cardBackground = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'secondary');
  return (
    <Animated.View
      entering={SlideInRight}
      exiting={SlideOutLeft}
      style={{
        padding: 16,
        backgroundColor: cardBackground,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      }}
    >
      <TouchableOpacity onPress={onPress}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{song.title}</Text>
        <Text style={{ color: secondaryColor }}>{song.author}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};