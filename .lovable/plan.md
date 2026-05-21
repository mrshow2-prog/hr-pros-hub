… 

## Goal
Verify ownership of `https://www.peoplestudiohr.com/` in Google Search Console and submit the sitemap, automated end-to-end.

## Steps

1. **Connect Google Search Console**
   - Trigger the connector flow so you can authorize Lovable with your Google account that will own the Search Console property.

2. **Request a verification token**
   - Call the Site Verification API through the connector gateway to get a `google-site-verification` meta tag value for `https://www.peoplestudiohr.com/`.

3. **Add the meta tag to the site `<head>`**
   - Inject the returned tag into `index.html` so it is present in the server-rendered HTML at the root URL.
   - This is the only code change in this plan.

4. **Publish**
   - You'll need to click Publish so the meta tag is live on `www.peoplestudiohr.com`. I'll pause and ask you to confirm after publishing before continuing.

5. **Verify ownership with Google**
   - Call the Site Verification `webResource` endpoint. Google fetches the homepage and confirms the meta tag.

6. **Add the site as a Search Console property**
   - PUT `https://www.peoplestudiohr.com/` to the Search Console sites endpoint so it appears in your property list.

7. **Submit the sitemap**
   - POST `https://www.peoplestudiohr.com/sitemap.xml` to the sitemaps endpoint for the property.

## Notes
- Uses your custom domain (matches canonical URLs and the sitemap).
- The verification meta tag is harmless and can stay in `<head>` permanently — Google rechecks it periodically.
- No changes to existing SEO files (`sitemap.xml`, `robots.txt`, `llms.txt`) needed.
- Other failing SEO findings (long titles/descriptions, Lighthouse perf/accessibility) are not addressed here — say the word and I'll tackle them in a follow-up.
