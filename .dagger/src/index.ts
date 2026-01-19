/**
 * Resume Dagger module for building and deploying resume PDF.
 */
import { dag, Container, Directory, File, Secret, object, func, argument } from "@dagger.io/dagger";

@object()
export class Resume {
  /**
   * Builds the resume PDF from LaTeX source.
   * @param source The source directory containing resume.tex
   * @returns The built resume.pdf file
   */
  @func()
  build(
    @argument({ defaultPath: "." })
    source: Directory,
  ): File {
    return dag
      .container()
      .from("blang/latex:ubuntu")
      .withMountedDirectory("/workspace", source)
      .withWorkdir("/workspace")
      .withExec(["pdflatex", "resume.tex"])
      .file("/workspace/resume.pdf");
  }

  /**
   * Builds the resume PDF and returns a container with AWS CLI for manual inspection.
   * @param source The source directory containing resume.tex
   * @returns A container with the built PDF and AWS CLI installed
   */
  @func()
  buildContainer(
    @argument({ defaultPath: "." })
    source: Directory,
  ): Container {
    const pdf = this.build(source);

    return dag
      .container()
      .from("amazon/aws-cli:latest")
      .withFile("/resume.pdf", pdf);
  }

  /**
   * Deploys the resume PDF and index.html to SeaweedFS S3.
   * @param source The source directory containing resume.tex and index.html
   * @param s3AccessKey The S3 access key for SeaweedFS
   * @param s3SecretKey The S3 secret key for SeaweedFS
   * @param endpoint The S3 endpoint URL (default: https://seaweedfs.sjer.red)
   * @param bucket The S3 bucket name (default: resume)
   * @returns A message indicating success or failure
   */
  @func()
  async deploy(
    @argument({ defaultPath: "." })
    source: Directory,
    s3AccessKey: Secret,
    s3SecretKey: Secret,
    @argument() endpoint = "https://seaweedfs.sjer.red",
    @argument() bucket = "resume",
  ): Promise<string> {
    const pdf = this.build(source);
    const indexHtml = source.file("index.html");

    const result = await dag
      .container()
      .from("amazon/aws-cli:latest")
      .withSecretVariable("AWS_ACCESS_KEY_ID", s3AccessKey)
      .withSecretVariable("AWS_SECRET_ACCESS_KEY", s3SecretKey)
      .withFile("/resume.pdf", pdf)
      .withFile("/index.html", indexHtml)
      .withExec([
        "aws",
        "--endpoint-url",
        endpoint,
        "s3",
        "cp",
        "/resume.pdf",
        `s3://${bucket}/resume.pdf`,
      ])
      .withExec([
        "aws",
        "--endpoint-url",
        endpoint,
        "s3",
        "cp",
        "/index.html",
        `s3://${bucket}/index.html`,
        "--content-type",
        "text/html",
      ])
      .stdout();

    return `Deployed resume.pdf and index.html to s3://${bucket}/\n${result}`;
  }
}
