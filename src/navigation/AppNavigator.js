import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    Dimensions,
    Platform,
} from 'react-native';
import {

    AboutPage,

    LoginScreen,

    RegistrationPage,
    Notifications as NotificationsPage,
   
} from '../screens';
var { height, width } = Dimensions.get('window');
import { useSelector } from "react-redux";
import i18n from 'i18n-js';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { Icon } from "react-native-elements";
import { MAIN_COLOR } from '../common/sharedFunctions';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppContainer() {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector(state => state.auth);
    const responseListener = useRef();
    const navigationRef = useNavigationContainerRef();
    const activeBookings = useSelector(state => state.bookinglistdata.active);

    useEffect(() => {
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const nData = response.notification.request.content.data;
            if (nData.screen) {
                if (nData.params) {
                    navigationRef.navigate(nData.screen, nData.params);
                } else {
                    navigationRef.navigate(nData.screen);
                }
            } else {
                navigationRef.navigate("TabRoot");
            }
        });     
    },[]);
    
    const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 852 || width === 852) || (height === 896 || width === 896) || (height === 926 || width === 926) || (height === 932 || width === 932))
    const screenOptions = {
        headerStyle: {
          backgroundColor: MAIN_COLOR,
          transform: [{ scaleX: isRTL ? -1 : 1 }]
        },
        headerTintColor: colors.TRANSPARENT,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
          color:'white',
          transform: [{ scaleX: isRTL ? -1 : 1 }]
        },
        headerBackImage: () => 
            <Icon
                name={isRTL?'arrow-right':'arrow-left'}
                type='font-awesome'
                color={colors.WHITE}
                size={25}
                style={{margin:10, transform: [{ scaleX: isRTL ? -1 : 1 }]}}
            /> 
    };
    
  
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{
                    animationTypeForReplace: 'pop',
                    animationEnabled:   Platform.OS == 'android'? false: true,
                }}
            >
                {auth.profile && auth.profile.uid ?
                    <Stack.Group>

                        <Stack.Screen name="About" component={AboutPage} options={{ title: t('about_us_menu'),...screenOptions }}/>
                       
                    </Stack.Group>
                    :
                    <Stack.Group screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={LoginScreen}/>
                        <Stack.Screen name="Register" component={RegistrationPage}/>
                    </Stack.Group>
                }
            </Stack.Navigator>
        </NavigationContainer>
    );
}