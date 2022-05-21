import { v4 as uuid } from 'uuid'
import jwtDecode, { JwtPayload } from 'jwt-decode';
import jwt from 'jsonwebtoken'
import { api } from './api';

type SignInRequestData = {
  email: string;
  password: string;
}

interface TokenData extends JwtPayload {
  name: string,
  email: string,
  avatar_url: string,
}

const delay = (amount = 750) => new Promise(resolve => setTimeout(resolve, amount))

export async function signInRequest(dataRquest: SignInRequestData) {
  // await delay()

  const { data } = await api.post('/login', {
    ...dataRquest
  })

  return {
    token: data.token,
    user: {...data.user}
  }

  // return {
  //   token: uuid(),
  //   user: {
  //     name: 'Diego Fernandes',
  //     email: 'diego@rocketseat.com.br',
  //     avatar_url: 'https://github.com/diego3g.png'
  //   }
  // }
}

export async function recoverUserInformation(token: string) {

  try {
    const validateJwt: TokenData | any = jwt.verify(token, 'your_secret_jwt')

    return {
        name: validateJwt.name,
        email: validateJwt.email,
        avatar_url: validateJwt.avatar_url,
    }
  } catch (error) {
    return null
  }

  
}