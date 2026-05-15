import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthScreenProps {
	children: React.ReactNode;
	footer?: React.ReactNode;
	scrollRef?: React.RefObject<KeyboardAwareScrollView | null>;
}

export function AuthScreen({ children, footer, scrollRef }: AuthScreenProps) {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1" style={{ backgroundColor: AUTH_COLORS.background }}>
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
					<View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}>
						<View className="gap-4">{children}</View>
						{footer ? <View className="mt-auto items-center pb-2">{footer}</View> : null}
					</View>
				</KeyboardAwareScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
