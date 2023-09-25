from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel

auth_routes = APIRouter()


# TODO: add password or tx sign + expiration for more security
class Credentials(BaseModel):
    wallet: str = '0x0'


@auth_routes.post('/token')
async def get_token(credentials: Credentials, authorize: AuthJWT = Depends()):
    access_token = authorize.create_access_token(subject=credentials.wallet)
    return {'access_token': access_token}
