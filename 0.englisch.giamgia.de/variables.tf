variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit permission for the target zone."
  type        = string
  sensitive   = true
}

variable "zone_name" {
  description = "Cloudflare zone name (root domain)."
  type        = string
}

variable "record_name" {
  description = "DNS record name to create/update (e.g. englisch.giamgia.de)."
  type        = string
  default     = "app"
}

variable "elb_hostname" {
  description = "AWS ELB hostname (e.g. a601d585a...elb.amazonaws.com)."
  type        = string
}

variable "ttl" {
  description = "Record TTL in seconds. Use 1 for 'Auto' in Cloudflare."
  type        = number
  default     = 300
}

variable "proxied" {
  description = "Whether to enable Cloudflare proxy (orange cloud). Keep false for plain LB CNAME."
  type        = bool
  default     = false
}
