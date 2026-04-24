import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
   children: React.ReactNode;
   footer?: React.ReactNode;
   scrollRef?: React.RefObject<KeyboardAwareScrollView | null>;
}

export function Screen({ children, footer, scrollRef }: ScreenProps) {
   const insets = useSafeAreaInsets();

   return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
         <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top}
         >
            <KeyboardAwareScrollView
               ref={scrollRef}
               enableOnAndroid
               extraHeight={120}
               extraScrollHeight={48}
               keyboardOpeningTime={0}
               contentInsetAdjustmentBehavior="automatic"
               contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 20,
                  paddingBottom: 20,
               }}
               keyboardShouldPersistTaps="handled"
               keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
               showsVerticalScrollIndicator={false}
            >
               <View className="flex-1 gap-8" style={{ paddingBottom: insets.bottom + 12 }}>
                  <View className="gap-8">{children}</View>
                  {footer ? <View className="mt-auto items-center gap-2 pb-2">{footer}</View> : null}
               </View>
            </KeyboardAwareScrollView>
         </KeyboardAvoidingView>
      </View>
   );
}
