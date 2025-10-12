import { NextRequest, NextResponse } from 'next/server';
import { OAuthAPI, WebhookScope } from '@ikas/api-client';
import moment from 'moment';
import { AuthToken, RedisDB } from '@/lib/redis';
import { config } from '@/globals/config';
import { getIkas } from '@/lib/ikas-api';

// GET /api/oauth/callback/ikas - İkas OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const storeName = searchParams.get('storeName');
    const state = searchParams.get('state');

    console.log('OAuth callback received:', { code: !!code, storeName, state: !!state });

    // Parametreleri doğrula
    if (!code || !storeName || !state) {
      console.error('Missing required parameters:', { code: !!code, storeName, state: !!state });
      const failUrl = new URL('/authorize-store', request.url);
      failUrl.searchParams.set('storeName', storeName || '');
      failUrl.searchParams.set('status', 'fail');
      failUrl.searchParams.set('error', 'missing_parameters');
      return NextResponse.redirect(failUrl);
    }

    // State doğrulaması (demo modu için basitleştirilmiş)
    try {
      const savedState = await RedisDB.state.get(state);
      if (state !== savedState) {
        console.error('State validation failed:', { received: state, saved: savedState });
        const failUrl = new URL('/authorize-store', request.url);
        failUrl.searchParams.set('storeName', storeName);
        failUrl.searchParams.set('status', 'fail');
        failUrl.searchParams.set('error', 'invalid_state');
        return NextResponse.redirect(failUrl);
      }
      // State'i temizle
      await RedisDB.state.del(state);
    } catch (error) {
      console.log('Redis not available, skipping state validation (demo mode)');
    }

    // Authorization code ile token al
    console.log('Getting token with authorization code...');
    const codeResponse = await OAuthAPI.getTokenWithAuthorizationCode(
      {
        code,
        client_id: config.appId,
        client_secret: config.appSecret,
        redirect_uri: config.callbackUrl,
      },
      { storeName }
    );

    if (!codeResponse.data) {
      console.error('Failed to get token:', codeResponse);
      const failUrl = new URL('/authorize-store', request.url);
      failUrl.searchParams.set('storeName', storeName);
      failUrl.searchParams.set('status', 'fail');
      failUrl.searchParams.set('error', 'token_failed');
      return NextResponse.redirect(failUrl);
    }

    // Token süre bilgisini hesapla
    const expireDate = moment().add(codeResponse.data.expires_in, 'seconds').toDate().toISOString();
    
    // Token objesi oluştur
    const token: AuthToken = {
      access_token: codeResponse.data.access_token,
      refresh_token: codeResponse.data.refresh_token,
      token_type: codeResponse.data.token_type,
      expires_in: codeResponse.data.expires_in,
      expireDate,
      authorizedAppId: '',
      merchantId: storeName,
    };

    // İkas client oluştur ve merchant bilgilerini al
    console.log('Getting merchant info...');
    const ikasClient = getIkas(token);
    const meResponse = await ikasClient.adminApi.queries.me({});

    if (meResponse.isSuccess && meResponse.data) {
      token.authorizedAppId = meResponse.data.id!;
      
      // Token'ı kaydet
      await RedisDB.token.set(token.authorizedAppId, token);
      console.log('Token saved for authorizedAppId:', token.authorizedAppId);

      // Webhook kaydı (opsiyonel)
      try {
        console.log('Registering webhooks...');
        for (const webhook of config.webhookEndpoints) {
          const webhookRes = await ikasClient.adminApi.mutations.saveWebhook({
            variables: {
              input: {
                endpoint: `${config.deployUrl}${webhook.address}`,
                scopes: [WebhookScope.ORDER_CREATED, WebhookScope.ORDER_UPDATED],
              },
            },
          });

          if (!webhookRes.isSuccess) {
            console.error('Webhook save error:', webhookRes.error || webhookRes.errors);
          } else {
            console.log('Webhook registered:', webhook.address);
          }
        }
      } catch (webhookError) {
        console.error('Webhook registration error:', webhookError);
        // Webhook hatası yetkilendirmeyi durdurmaz
      }

      // Başarılı yetkilendirme - ikas admin dashboard'a yönlendir
      const successUrl = `https://${storeName}.myikas.com/admin/authorized-app/${token.authorizedAppId}`;
      console.log('Redirecting to success URL:', successUrl);
      return NextResponse.redirect(successUrl);
    } else {
      console.error('Failed to get merchant info:', meResponse);
      const failUrl = new URL('/authorize-store', request.url);
      failUrl.searchParams.set('storeName', storeName);
      failUrl.searchParams.set('status', 'fail');
      failUrl.searchParams.set('error', 'merchant_info_failed');
      return NextResponse.redirect(failUrl);
    }

  } catch (error: any) {
    console.error('Callback error:', error);
    const failUrl = new URL('/authorize-store', request.url);
    failUrl.searchParams.set('storeName', '');
    failUrl.searchParams.set('status', 'fail');
    failUrl.searchParams.set('error', 'internal_error');
    return NextResponse.redirect(failUrl);
  }
}