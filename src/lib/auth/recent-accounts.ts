const KEY = "rj_recent_accounts";
const MAX = 6;

export interface RecentAccount {
  id: string;
  role: "solver" | "admin" | "creator";
  displayName: string;
  token: string;
}

export function getRecentAccounts(): RecentAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentAccount[];
  } catch {
    return [];
  }
}

export function addRecentAccount(account: RecentAccount): void {
  const list = getRecentAccounts().filter((a) => a.id !== account.id);
  list.unshift(account);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function removeRecentAccount(id: string): void {
  const list = getRecentAccounts().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}
