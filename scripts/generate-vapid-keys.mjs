#!/usr/bin/env node
import webpush from 'web-push'

const vapidKeys = webpush.generateVAPIDKeys()

console.log('VAPID Keys Generated\n')
console.log('Add these to .env.local and Vercel:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
