import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { TextInput as Input } from 'react-native-paper';

type Props = React.ComponentProps<typeof Input> & { errorText?: string };

const TextInput = ({ errorText, ...props }: Props) => (
  <View>
    <Input
      underlineColor="transparent"
      mode="outlined"
      {...props}
    />
    {errorText ? <Text>{errorText}</Text> : null}
  </View>
);

export default memo(TextInput);