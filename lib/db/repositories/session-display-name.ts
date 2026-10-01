import "server-only";

import { sql } from "drizzle-orm";

import { classes, sessions } from "../schema.ts";

/** A Session may override its generated series number with a purpose-written display name. */
export const sessionDisplayName = sql<string>`
  case
    when ${sessions.displayName} is not null then ${sessions.displayName}
    when ${sessions.recurrenceGroupId} is null then ${classes.name}
    else ${classes.name} || ' - ' || (
      select count(*)::text
      from ${sessions} as numbered_sessions
      where numbered_sessions.recurrence_group_id = ${sessions.recurrenceGroupId}
        and (
          numbered_sessions.starts_at < ${sessions.startsAt}
          or (numbered_sessions.starts_at = ${sessions.startsAt} and numbered_sessions.id <= ${sessions.id})
        )
    )
  end
`;
