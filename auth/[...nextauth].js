import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../lib/mongodb';

export const authOptions = {
  // No adapter — we handle user storage manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ email });

        if (!user || !user.password) throw new Error('InvalidCredentials');
        if (!user.verified) throw new Error('NotVerified');

        const valid = await bcrypt.compare(String(credentials.password), user.password);
        if (!valid) throw new Error('InvalidCredentials');

        return { id: user._id.toString(), email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign in — create user if doesn't exist
      if (account?.provider === 'google') {
        const client = await clientPromise;
        const db = client.db();
        const existing = await db.collection('users').findOne({ email: user.email });
        if (!existing) {
          await db.collection('users').insertOne({
            name: user.name,
            email: user.email,
            image: user.image,
            verified: true,
            createdAt: new Date(),
            apis: {},
            config: {
              videosPerDay: 5,
              uploadEnabled: true,
              contentTypes: ['storytelling', 'dance', 'top5'],
              preferredTime: '19:00',
              voiceId: 'Rachel',
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);