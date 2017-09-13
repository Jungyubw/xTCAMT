package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.util;

import javax.servlet.http.HttpServletRequest;

import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.util.FileStorageUtil;

public class HttpUtil {

	public static String getAppUrl(HttpServletRequest request) {
		String scheme = request.getScheme();
		String host = request.getHeader("Host");
		String url = scheme + "://" + host + request.getContextPath();
		return url;
	}

	public static String getImagesRootUrl(HttpServletRequest request) {
		return HttpUtil.getAppUrl(request) + "/api" + FileStorageUtil.root;
	}
}
