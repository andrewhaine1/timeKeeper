import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { getPalette } from '@/src/theme';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectModalProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  trigger?: 'field' | 'icon';
  icon?: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}

export function SelectModal({
  label,
  value,
  options,
  onChange,
  disabled,
  trigger = 'field',
  icon = 'filter-outline',
  active,
}: SelectModalProps) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const palette = getPalette(isDark);
  const selected = options.find((o) => o.value === value);

  const triggerElement =
    trigger === 'icon' ? (
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={[styles.iconTrigger, { opacity: disabled ? 0.5 : 1 }]}
      >
        <Ionicons name={icon} size={22} color={active ? palette.primary : palette.text} />
      </Pressable>
    ) : (
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          { borderColor: palette.border, backgroundColor: palette.surface, opacity: disabled ? 0.6 : 1 },
        ]}
      >
        <Text style={{ color: palette.text }}>{selected?.label ?? 'Select...'}</Text>
      </Pressable>
    );

  const modalElement = (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.option, { borderBottomColor: palette.border }]}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text
                  style={{
                    color: item.value === value ? palette.primary : palette.text,
                    fontWeight: item.value === value ? '700' : '400',
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );

  if (!label) {
    return (
      <>
        {triggerElement}
        {modalElement}
      </>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      {triggerElement}
      {modalElement}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  trigger: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconTrigger: {
    padding: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
