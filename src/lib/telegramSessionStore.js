const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const sessions = new Map();

export function getTelegramSession(chatId) {
    const key = String(chatId);
    const now = Date.now();
    let session = sessions.get(key);

    if (!session || now - session.updatedAt > SESSION_TTL_MS) {
        session = {
            cart: new Map(),
            currentCategoryId: null,
            currentPage: 0,
            checkout: null,
            updatedAt: now,
        };
        sessions.set(key, session);
    }

    session.updatedAt = now;
    for (const [sessionKey, storedSession] of sessions) {
        if (now - storedSession.updatedAt > SESSION_TTL_MS) {
            sessions.delete(sessionKey);
        }
    }

    return session;
}
