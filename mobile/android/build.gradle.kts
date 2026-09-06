allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
    
    afterEvaluate {
        if (hasProperty("android")) {
            try {
                val androidExt = extensions.getByName("android")
                val namespaceProp = androidExt.javaClass.getMethod("getNamespace").invoke(androidExt)
                if (namespaceProp == null) {
                    val groupStr = group.toString()
                    androidExt.javaClass.getMethod("setNamespace", String::class.java).invoke(androidExt, groupStr)
                }
                
                // Force compileSdk to 37 for all plugins
                try {
                    androidExt.javaClass.getMethod("compileSdkVersion", Int::class.java).invoke(androidExt, 37)
                } catch (e: Exception) {
                    try {
                        androidExt.javaClass.getMethod("setCompileSdkVersion", Int::class.java).invoke(androidExt, 37)
                    } catch (e2: Exception) {
                        // ignore
                    }
                }

                val compileOptions = androidExt.javaClass.getMethod("getCompileOptions").invoke(androidExt)
                compileOptions.javaClass.getMethod("setSourceCompatibility", org.gradle.api.JavaVersion::class.java).invoke(compileOptions, org.gradle.api.JavaVersion.VERSION_17)
                compileOptions.javaClass.getMethod("setTargetCompatibility", org.gradle.api.JavaVersion::class.java).invoke(compileOptions, org.gradle.api.JavaVersion.VERSION_17)
            } catch (e: Exception) {
                // Ignore
            }
        }
    }
    
    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        compilerOptions {
            jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
        }
    }
    
    tasks.withType<JavaCompile>().configureEach {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }
}

subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
