/**
 * 使用 TextEncoder 将字符串转换为字节数组。
 * @param str - 要转换的字符串。
 * @returns 转换后的字节数组。
 */
export function str2bytes(str: string): number[] {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);
  return Array.from(uint8Array);
}

export function bytes2str(array: Uint8Array): string {
  const decoder = new TextDecoder();
  const str = decoder.decode(array);
  return str;
}