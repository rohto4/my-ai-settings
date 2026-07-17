# Permission Contract Template

```markdown
# {Capability} permission contract

## Actors and trust boundaries
| Actor | Identity source | Tenant or org context | Trust notes |
| --- | --- | --- | --- |

## Resources and ownership
| Resource | Owner | Lifecycle | Sensitive fields |
| --- | --- | --- | --- |

## Capabilities
| Capability | Resource | Scope | Constraints | Audit required |
| --- | --- | --- | --- | --- |

## Roles and grants
| Role | Grants | Explicit exclusions |
| --- | --- | --- |

## Precedence
- Default: deny
- Explicit deny: ...
- Inheritance: ...
- Conflict resolution: ...

## Delegation and revocation
- Grant authority: ...
- Maximum scope: ...
- Expiration: ...
- Revocation propagation: ...

## Enforcement points
| Entry point | Decision input | Enforcement owner |
| --- | --- | --- |

## Test matrix
| Actor | Action | Resource scope | Expected | Reason |
| --- | --- | --- | --- | --- |
```
