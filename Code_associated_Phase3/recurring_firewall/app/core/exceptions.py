class FirewallError(Exception):
    """Base class for all application exceptions."""
    pass

class ResourceNotFoundError(FirewallError):
    """Raised when a requested resource (merchant, transaction) is not found."""
    pass

class ConfigurationError(FirewallError):
    """Raised when a required configuration or file is missing."""
    pass

class ScoringError(FirewallError):
    """Raised when transaction scoring fails."""
    pass

class LLMError(FirewallError):
    """Raised when the LLM provider fails."""
    pass

class DatabaseError(FirewallError):
    """Raised when a database operation fails."""
    pass
