import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface AuthHeroProps {
	badge?: string;
	title: string;
	description: string;
}

export function AuthHero({ badge = 'Gym App Mobile', title, description }: AuthHeroProps) {
	return (
		<View className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900 px-6 py-7 dark:border-slate-800 dark:bg-slate-900">
			<View className="absolute -top-12 -right-8 h-32 w-32 rounded-full bg-sky-400/20" />
			<View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-emerald-300/15" />
			<View className="gap-6">
				<View className="flex-row items-center justify-between">
					<View className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
						<Text className="text-[11px] font-medium uppercase tracking-[2px] text-slate-200">
							{badge}
						</Text>
					</View>
					<View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
						<Text className="text-xl">GA</Text>
					</View>
				</View>

				<View className="gap-3">
					<Text variant="headlineMedium" className="font-semibold leading-tight text-white">
						{title}
					</Text>
					<Text className="text-sm leading-6 text-slate-300">{description}</Text>
				</View>

				<View className="flex-row gap-3">
					<View className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4">
						<Text className="text-2xl font-semibold text-white">24/7</Text>
						<Text className="mt-1 text-xs leading-5 text-slate-300">
							Acceso al panel desde cualquier lugar.
						</Text>
					</View>
					<View className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4">
						<Text className="text-2xl font-semibold text-white">+120</Text>
						<Text className="mt-1 text-xs leading-5 text-slate-300">
							Sesiones y seguimientos centralizados.
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
