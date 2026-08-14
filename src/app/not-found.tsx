import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="muted mt-2">
        This page does not exist, or you are not a member of that group.
      </p>
      <Link href="/groups" className="btn-primary mt-5">
        Go to my groups
      </Link>
    </div>
  );
}
