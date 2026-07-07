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
        boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <TouchableOpacity onPress={onPress}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{song.title}</Text>
        <Text style={{ color: secondaryColor }}>{song.author}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};