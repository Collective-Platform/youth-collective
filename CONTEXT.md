# Church records context

This context holds the church's durable people and ministry history. Booking is one
way a person participates; it is not the definition of the person.

## Identity and access

**Person**: An individual known to the church, whether or not they are a member, a youth participant, or have an account.
_Avoid_: User, account, member

**User account**: An optional authenticated login that grants a person access to the platform. It is not the church's canonical identity record.
_Avoid_: Person, profile

**Privacy consent**: A person's acceptance of the platform privacy policy when creating their first user account.
_Avoid_: Booking consent

**Household**: A group of people who share a family or pastoral relationship. It does not imply that their accounts or consent are shared.
_Avoid_: Account family

## Ministry and participation

**Course**: A reusable learning journey that groups related Classes, such as “Knowing God”.
_Avoid_: Programme, Class

**Class**: One audience-specific offering within a Course, such as “Who Is God? — Teens”.
_Avoid_: Course, Session

**Session**: A dated, individually bookable meeting of a Class.
_Avoid_: Course, Class

**Numbered session series**: A set of related Sessions in one Class, identified by their chronological position, such as “Who Is God? - 1”. It does not create a separate Class.
_Avoid_: Separate Class, separate Course

**Registration**: A person's request or confirmed place in a Course or Session.
_Avoid_: Attendance, booking (outside bookable occurrences)

**Attendance**: A record that a registered or invited person was present, absent, or excused at an occurrence.
_Avoid_: Registration, booking

**Participation history**: A derived chronological view of a person's registrations, attendance, church rites, and mission participation; it is not a single stored field.
_Avoid_: Activity field, notes

## Church records

**Church rite**: A church-recognised milestone, such as baptism, confirmation, marriage, or dedication, recorded with its participants and official details.
_Avoid_: Programme, attendance

**Certificate**: A versioned, issued document that attests to a specific church rite or achievement and can be verified by an identifier.
_Avoid_: Rite record, file

**Mission report**: A structured or submitted account of a person's work or experience for a mission participation.
_Avoid_: Attendance, certificate
