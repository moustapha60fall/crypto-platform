package tdsi2025.mcs.util;

import java.util.Base64;

public class Utils {

    private static final String DIGITS = "0123456789abcdef";

    public static String toHex(byte[] data, int length) {
        StringBuilder buf = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int v = data[i] & 0xff;
            buf.append(DIGITS.charAt(v >> 4));
            buf.append(DIGITS.charAt(v & 0xf));
        }
        return buf.toString();
    }

    public static String toHex(byte[] data) {
        return toHex(data, data.length);
    }

    public static String prettyHex(byte[] data, int groupSize, String separator, boolean upperCase) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < data.length; i++) {
            sb.append(String.format(upperCase ? "%02X" : "%02x", data[i]));
            if ((i + 1) % groupSize == 0 && i + 1 < data.length)
                sb.append(separator);
        }
        return sb.toString();
    }

    public static String toBase64(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    public static byte[] fromBase64(String base64) {
        return Base64.getDecoder().decode(base64);
    }

    public static String safeToHex(byte[] data) {
        return (data == null) ? "<null>" : toHex(data);
    }
}
