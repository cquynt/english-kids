variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit permission for the target zone."
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region used for S3 static hosting."
  type        = string
  default     = "eu-central-1"
}

variable "aws_bucket_name" {
  description = "S3 bucket name for the static website."
  type        = string
}

variable "zone_name" {
  description = "Cloudflare zone name (root domain)."
  type        = string
}

variable "subdomain" {
  description = "Subdomain name to create under the zone (e.g. english)."
  type        = string
  default     = "english"
}

variable "ttl" {
  description = "Record TTL in seconds. Use 1 for 'Auto' in Cloudflare."
  type        = number
  default     = 1
}

variable "proxied" {
  description = "Whether to enable Cloudflare proxy (orange cloud)."
  type        = bool
  default     = true
}

variable "build_output_path" {
  description = "Path to frontend build output folder to upload to S3 (relative to this module)."
  type        = string
  default     = "../web/out"
}

variable "upload_assets" {
  description = "Set to true to upload frontend build files to S3 through Terraform."
  type        = bool
  default     = true
}
