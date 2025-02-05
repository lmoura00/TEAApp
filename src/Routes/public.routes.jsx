import {createNativeStackNavigator} from '@react-navigation/native-stack'
import { Login } from '../Pages/Login'
import { Cad } from '../Pages/Cad'

export function PublicRoutes(){
    const {Navigator, Screen} = createNativeStackNavigator()
    return(
        <Navigator>
            <Screen name='Login' component={Login} options={{headerShown:false}}/>
            <Screen name='Cad' component={Cad} options={{headerShown:false}}/>
        </Navigator>
    )
}