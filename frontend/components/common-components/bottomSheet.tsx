import React, { useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '@/context/ThemeContext';

type BottomModalSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomModalSheet({ visible, onClose, children }: BottomModalSheetProps) {
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['40%', '90%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    dragIndicator: {
      width: 64,
      height: 4,
      borderRadius: 3,
      backgroundColor: theme.colors.black10,
      alignSelf: 'center',
      marginBottom: 16,
    },
  });

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      index={-1} // по умолчанию скрыт
    >
      <View style={styles.contentContainer}>
        <View style={styles.dragIndicator} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {children}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
