import { StyleSheet } from 'react-native';
import { COLORS, Z_INDEX } from './constants';

export const baseStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
});

export const errorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.light.error,
    zIndex: Z_INDEX.error,
  },
  text: {
    color: COLORS.light.text,
    fontSize: 14,
    flex: 1,
    marginRight: 16,
  },
});

export const messageStyles = StyleSheet.create({
  text: {
    color: COLORS.light.text,
    flex: 1,
    fontSize: 16,
    marginHorizontal: 12,
  },
}); 