import {createNativeStackNavigator} from '@react-navigation/native-stack'
import { Home } from '../Pages/Home'


export function AuthRoutes(){
    const {Navigator, Screen} = createNativeStackNavigator()
    return(
        <Navigator>
            <Screen name='Home' component={Home}/>
           
        </Navigator>
    )
}