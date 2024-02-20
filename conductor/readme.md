# Welcome! Might you be a conductor?

*Foreword*

I don't know how far this project will evolve. Hopefully it gains some traction, not only because I care about privacy, but also because then I will be able to say "I maintain a popular project"

Anyways, the thing with this specific project is that the more popular it gets, the more I need to let go. The whole point of this project is to not have it be controlled by a single entity, not even me.

And without control, when in need of volounteers, there are some things that you need to entrust to the volounteers.

So. Please read this before becoming a conductor.

Thank you.

## What does a conductor do?

A conductor keeps a list of all the nodes under themselves. There are two types of conductors:

- **Layer 1 conductors**
Layer 1 conductors are the ones which will keep a list of all the users actually using the service.

- **Layer n+1 conductors** (n a non-null natural number)
Layer n+1 conductors are the ones which will keep a list of all the conductors at layer n beneath them.

Beneath these layers, layer 0 are all the users of the metro system

If you've done CS, you can think of this as a tree where all the leaves are users; and where users are at a fixed depth.

## What are conductors entrusted with? (or: Guidelines for a conductor)

### All layer conductors are asked to

- **Run open source code.** And, not lie about it.
This one is for the effective transparency of the system. The whole presupposition of this service is for it to be transparent, and for the traffic to remain invisible. Therefore, we really need you to run an open source conductor.

You may run a conductor that is not affiliated with me and my horrible programming, just have it be open.

### Layer [big number] conductors are asked to

- **Be skeptic about who you're letting in the system**
In a 5 layer metro system, if you're in layer 4 or 5... please don't just let anyone run a conductor. At least please make sure they're following the guidelines

I'll get back to coding now. Writing's not my talent to be honest.
