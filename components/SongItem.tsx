import { Text, TouchableOpacity } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

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

export const SongItem = ({ song, onPress }: SongItemProps) => (
  <Animated.View
    entering={SlideInRight}
    exiting={SlideOutLeft}
    style={{
      padding: 16,
      backgroundColor: '#fff',
      marginBottom: 8,
      borderRadius: 8,
      elevation: 2,
    }}
  >
    <TouchableOpacity onPress={onPress}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{song.title}</Text>
      <Text style={{ color: '#666' }}>{song.author}</Text>
    </TouchableOpacity>
  </Animated.View>
);