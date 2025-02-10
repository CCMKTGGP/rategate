export const PLATFORMS = [
  {
    id: "FACEBOOK",
    platformName: "Facebook",
    helperText: "Enter your facebook page url here",
    label: "Label",
  },
  {
    id: "GOOGLE",
    platformName: "Google",
    helperText: "Enter your Google Business Profile URL here",
    label: "Label",
  },
  {
    id: "TRUSTPILOT",
    platformName: "Trustpilot",
    helperText: "Enter your Trustpilot url here",
    label: "Label",
  },
  {
    id: "CAPTERRA",
    platformName: "Capterra",
    helperText: "Enter your Capterra url here",
    label: "Label",
  },
  {
    id: "TRIPADVISOR",
    platformName: "Tripadvisor",
    helperText: "Enter your Tripadvisor url here",
    label: "Label",
  },
  {
    id: "YELP",
    platformName: "Yelp",
    helperText: "Enter your Yelp url here",
    label: "Label",
  },
  {
    id: "FOURSQUARE",
    platformName: "Foursquare",
    helperText: "Enter your Foursquare url here",
    label: "Label",
  },
  {
    id: "HOMESTARS",
    platformName: "HomeStars",
    helperText: "Enter your HomeStars url here",
    label: "Label",
  },
  {
    id: "HOUZZ",
    platformName: "Houzz",
    helperText: "Enter your Houzz url here",
    label: "Label",
  },
];

export function getPlatformPlaceholder(id: string, businessName: string) {
  switch (id) {
    case "FACEBOOK":
      return `https://www.facebook.com/${businessName}/reviews`;
    case "GOOGLE":
      return `https://g.page/r/${businessName}/reviews`;
    case "TRUSTPILOT":
      return `https://trustpilot.com/reviews/${businessName}`;
    case "CAPTERRA":
      return `https://capterra.com/p/184192/${businessName}`;
    case "TRIPADVISOR":
      return `https://tripadvisor.com/...x12312-Reviews-${businessName}`;
    case "YELP":
      return `https://yelp.com/biz/${businessName}`;
    case "FOURSQUARE":
      return `https://foursquare.com/v/${businessName}/`;
    case "HOMESTARS":
      return `https://homestars.com/v/${businessName}/`;
    case "HOUZZ":
      return `https://houzz.com/v/${businessName}/`;
    default:
      return "Enter your url";
  }
}
