import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import calls from '@/assets/data/calls.json';
import { Ionicons } from "@expo/vector-icons";
import { format } from 'date-fns';
import SegmentedControl from "@/components/SegmentedControl";
import Animated, { CurvedTransition, FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import SwipeableRow from "@/components/SwipeableRow";
import * as Haptics from 'expo-haptics';

const Page = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState(calls);
  const [selectedOption, setSelectedOption] = useState('All');
  const editing = useSharedValue(-30);
  const AnimatedToucheableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

  const editAction = () => {
    editing.value = !isEditing ? 0 : -30;
    setIsEditing(!isEditing);
  }

  const removeCall = (call: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(items.filter((item) => item.id !== call.id));
  }

  const animatedRowStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(editing.value) }],
  }));

  useEffect(() => {
    selectedOption === 'All' ? setItems(calls) : setItems(calls.filter((call) => call.missed));
  }, [selectedOption]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{
        headerTitle: () => (
          <SegmentedControl
            options={['All', 'Missed']}
            selectedOption={selectedOption}
            onOptionPress={setSelectedOption}
          />
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={editAction}>
            <Text style={{ color: Colors.primary, fontSize: 18 }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{paddingBottom: 40}}>
        <Animated.View style={defaultStyles.block} layout={CurvedTransition.delay(150)}>
          <Animated.FlatList
            skipEnteringExitingAnimations
            scrollEnabled={false}
            data={items}
            keyExtractor={item => item.id.toString()}
            ItemSeparatorComponent={() => <View style={defaultStyles.separator} />}
            itemLayoutAnimation={CurvedTransition.delay(150)}
            renderItem={({ item, index }) => (
              <SwipeableRow onDelete={() => removeCall(item)}>
                <Animated.View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  entering={FadeInUp.delay(index * 20)}
                  exiting={FadeOutUp}>

                  <AnimatedToucheableOpacity onPress={() => removeCall(item)} style={[animatedRowStyles, {paddingLeft: 8}]}>
                    <Ionicons name="remove-circle" size={24} color={Colors.red}/>
                  </AnimatedToucheableOpacity>

                  <Animated.View style={[defaultStyles.item, animatedRowStyles, {paddingLeft: 10}]}>
                    <Image source={{ uri: item.img }} style={styles.avatar} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 18, color: item.missed ? Colors.red : '#000' }}>
                        {item.name}
                      </Text>

                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        <Ionicons name={item.video ? 'videocam' : 'call'} size={16} color={Colors.gray}/>
                        <Text style={{ color: Colors.gray, flex: 1 }}>
                          {item.incoming ? 'Incoming' : 'Outgoing'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <Text style={{ color: Colors.gray }}>{format(item.date, 'MM.dd.yy')}</Text>
                      <Ionicons name="information-circle-outline" size={24} color={Colors.primary}/>
                    </View>
                  </Animated.View>
                </Animated.View>
              </SwipeableRow>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Page;