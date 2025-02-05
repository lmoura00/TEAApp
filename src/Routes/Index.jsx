import {NavigationContainer} from '@react-navigation/native'

import {AuthRoutes} from './auth.routes'
import {PublicRoutes} from './public.routes'

import { useAuth } from '../Hooks/Auth'
import { Splash } from '../Pages/Splash'

export function Routes(){
    
    const {user} = useAuth()

        return(
            <NavigationContainer>
                
                {user ? <AuthRoutes/> : <PublicRoutes/>}
            </NavigationContainer>
        )
}